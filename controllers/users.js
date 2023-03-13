import firebase from "../firebase/config.js";
import moment from "moment";
import { stripe } from "../stripe/config.js";

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
                    price: priceId,
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
            service_expry: moment().unix(),
            stripe_issuing_cust_id: "",
            card_usage: [],
            card_token: "",
        };

        await usersRef.doc(authId).set(data);
        await stripeRef.doc(customer.id).set({ uid: authId });

        res.send({
            subscriptionId: subscription.id,
            clientSecret:
                subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        res.status(400).json({
            data: error.message,
        });
        return;
    }
};

export { createUser };
