import { firebase } from '../config/firebase.js';
import moment from 'moment';
import { stripe } from '../config/stripe.js';
import { getUser } from '../helpers/firebase.js';
import { Response } from 'express';
import { IAuthorizedRouteReq } from '../definitionfile';
import Stripe from 'stripe';

const createUser = async (req: IAuthorizedRouteReq, res: Response) => {
  // creates a customer and subscription in stripe, and returns the subscription ID and client secret
  const { authId, email } = req;
  const usersRef = firebase.firestore().collection('users');
  const stripeRef = firebase.firestore().collection('stripe');

  try {
    const customer = await stripe.customers.create({
      email
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: 'price_1MlImlAera2crwedQBRYFyXc'
        }
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    const data = {
      stripeCustId: customer.id,
      stripeSubscriptonId: subscription.id,
      email,
      name: '',
      address: '',
      expiration: moment().unix(),
      stripeIssuingCustId: '',
      card_usage: [''],
      card_token: '',
      proxy_email: '',
      mailslurp_id: ''
    };

    await usersRef.doc(authId).set(data);
    await stripeRef.doc(customer.id).set({ uuid: authId });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    res.send({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(400).json({
      data: error.message
    });
  }
};

const deactivateUser = async (req: IAuthorizedRouteReq, res: Response) => {
  // cancels subscription for and wipes user data from stripe and firestore
  const { authId } = req;
  const usersRef = firebase.firestore().collection('users');
  const stripeRef = firebase.firestore().collection('stripe');

  try {
    const data = await getUser(authId);
    const { stripeCustId, stripeSubscriptonId } = data;
    const deletedSubscription = await stripe.subscriptions.del(
      stripeSubscriptonId
    );

    await stripeRef.doc(stripeCustId).delete();
    await usersRef.doc(authId).delete();

    res.send({ deletedSubscription });
  } catch (error) {
    res.status(400).json({
      data: error.message
    });
  }
};

const updateSubscription = async (req: IAuthorizedRouteReq, res: Response) => {
  const { authId } = req;

  try {
    const data = await getUser(authId);
    const subscription = await stripe.subscriptions.retrieve(
      data.stripeSubscriptonId
    );
    const updatedSubscription = await stripe.subscriptions.update(
      data.stripeSubscriptonId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: 'price_1MlImlAera2crwedQBRYFyXc'
          }
        ]
      }
    );

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    res.send({
      subscriptionId: updatedSubscription.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

export { createUser, deactivateUser, updateSubscription };
