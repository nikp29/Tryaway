import { firebase } from "../config/firebase.js";
import moment from "moment";
import { stripe } from "../config/stripe.js";
import { getUser } from "../helpers/firebase.js";

const createUser = async (req, res) => {
    // creates a customer and subscription in stripe, and returns the subscription ID and client secret
    const { authId, email } = req;
    const usersRef = firebase.firestore().collection("users");
    const stripeRef = firebase.firestore().collection("stripe");

    try {
        const customer = await stripe.customers.create({
            email,
        });

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [
                {
                    price: "price_1MlImlAera2crwedQBRYFyXc",
                },
            ],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
        });

        data = {
            stripe_cust_id: customer.id,
            stripe_subscripton_id: subscription.id,
            email,
            name: "",
            address: "",
            expiration: moment().unix(),
            stripe_issuing_cust_id: "",
            card_usage: [],
            card_token: "",
            proxy_email: "",
            mailslurp_id: "",
        };

        await usersRef.doc(authId).set(data);
        await stripeRef.doc(customer.id).set({ uuid: authId });

        res.send({
            subscriptionId: subscription.id,
            clientSecret:
                subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        res.status(400).json({
            data: error.message,
        });
    }
};

const deactivateUser = async (req, res) => {
    // cancels subscription for and wipes user data from stripe and firestore
    const { authId } = req;
    const usersRef = firebase.firestore().collection("users");
    const stripeRef = firebase.firestore().collection("stripe");

    try {
        const data = await getUser(authId);
        const { stripe_cust_id, stripe_subscripton_id } = data;
        const deletedSubscription = await stripe.subscriptions.del(
            stripe_subscripton_id
        );

        await stripeRef.doc(stripe_cust_id).delete();
        await usersRef.doc(authId).delete();

        res.send({ deletedSubscription });
    } catch (error) {
        res.status(400).json({
            data: error.message,
        });
    }
};

const updateSubscription = async (req, res) => {
    const { authId } = req;

    try {
        const data = await getUser(authId);
        const subscription = await stripe.subscriptions.retrieve(
            data.stripe_subscripton_id
        );
        const updatedSubscription = await stripe.subscriptions.update(
            data.stripe_subscripton_id,
            {
                items: [
                    {
                        id: subscription.items.data[0].id,
                        price: "price_1MlImlAera2crwedQBRYFyXc",
                    },
                ],
            }
        );

        res.send({
            subscriptionId: updatedSubscription.id,
            clientSecret:
                subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        return res.status(400).send({ error: { message: error.message } });
    }
};

export { createUser, deactivateUser, updateSubscription };
