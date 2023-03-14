import { stripe } from '../config/stripe.js';
import moment from 'moment';
import { updateUser, getStripeCustomer } from './firebase.js';

const handlePaymentSuccess = async (dataObject: any) => {
  // The subscription automatically activates after successful payment
  // Set the payment method used to pay the invoice
  // as the default payment method for that subscription
  const subscriptionId = dataObject.subscription;
  const paymentIntentId = dataObject.payment_intent;

  // Retrieve the payment intent used to pay the subscription
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  try {
    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentIntent.payment_method.toString()
    });

    console.log(
      'Default payment method set for subscription:' +
        paymentIntent.payment_method
    );

    // Update the user's subscription status in Firestore
    const stripeCustObj = await getStripeCustomer(dataObject.customer);
    const uuid = stripeCustObj.uuid;
    await updateUser(uuid, { expiration: moment().add(1, 'month').unix() });
  } catch (err) {
    console.log(err);
    console.log(
      `⚠️  Falied to update the default payment method for subscription: ${subscriptionId}`
    );
  }
};

export { handlePaymentSuccess };
