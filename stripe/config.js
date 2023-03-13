import stripe_ from "stripe";

const stripe = stripe_(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
    appInfo: {
        // For sample support and debugging, not required for production:
        name: "nikp29/TrialDaddy",
        version: "0.0.1",
        url: "https://github.com/nikp29/TrialDaddy",
    },
});

export { stripe };
