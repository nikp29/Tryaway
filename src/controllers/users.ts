import { firebase } from '../config/firebase.js';
import moment from 'moment';
import { stripe } from '../config/stripe.js';
import { getUser, updateUser } from '../helpers/firebase.js';
import { Response } from 'express';
import { IAuthorizedRouteReq } from '../definitionfile';
import { createInbox } from '../helpers/mailslurp.js';
import psl from 'psl';
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
      error
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
      error
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
    res.status(400).send({ error });
  }
};

const domainFromUrl = (url: string) => {
  let hostname;
  // find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  // find & remove port number
  hostname = hostname.split(':')[0];
  // find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
};

const activateAccount = async (req: IAuthorizedRouteReq, res: Response) => {
  const { authId } = req;

  try {
    const user = await getUser(authId);

    if (user.expiration <= moment().unix()) {
      res.status(400).send({ error: 'expired' });
    }
    const domain = psl.get(domainFromUrl(req.body.url));
    if (user.mailslurp_id === '' || user.card_usage.includes(domain)) {
      await createInbox(authId, user.email);
    } else {
      updateUser(authId, { card_usage: user.card_usage.push(domain) });
    }

    res.send({ email: user.proxy_email, card_token: user.card_token });
  } catch (error) {
    res.status(400).send({ error });
  }
};

export { activateAccount, createUser, deactivateUser, updateSubscription };
