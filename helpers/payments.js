import { stripe } from "../config/stripe.js";
import { firebase } from "../config/firebase.js";
import moment from "moment";
import { updateUser, getStripeCustomer } from "../helpers/firebase.js";

const handlePaymentSuccess = async (dataObject) => {
    // The subscription automatically activates after successful payment
    // Set the payment method used to pay the invoice
    // as the default payment method for that subscription
    const subscription_id = dataObject["subscription"];
    const payment_intent_id = dataObject["payment_intent"];

    // Retrieve the payment intent used to pay the subscription
    const payment_intent = await stripe.paymentIntents.retrieve(
        payment_intent_id
    );

    try {
        await stripe.subscriptions.update(subscription_id, {
            default_payment_method: payment_intent.payment_method,
        });

        console.log(
            "Default payment method set for subscription:" +
                payment_intent.payment_method
        );

        // Update the user's subscription status in Firestore
        const stripe_cust_obj = await getStripeCustomer(dataObject["customer"]);
        const uuid = stripe_cust_obj.uuid;
        await updateUser(uuid, { expiration: moment().add(1, "month").unix() });
    } catch (err) {
        console.log(err);
        console.log(
            `⚠️  Falied to update the default payment method for subscription: ${subscription_id}`
        );
    }
};

export { handlePaymentSuccess };
