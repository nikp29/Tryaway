import Stripe from 'stripe';
import { stripeSecretKey } from '../stripekey.js';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: null,
  appInfo: {
    // For sample support and debugging, not required for production:
    name: 'nikp29/Tryaway',
    version: '0.0.1',
    url: 'https://github.com/nikp29/Tryaway'
  }
});

export { stripe };
