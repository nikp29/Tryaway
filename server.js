import express from "express";
const app = express();
import { resolve } from "path";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { stripe } from "./config/stripe.js";
import { handlePaymentSuccess } from "./helpers/payments.js";
import routes from "./routes/index.js";

dotenv.config();

app.use(helmet());
app.disable("x-powered-by");
app.use(
    cors({
        origin: "*",
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        },
    })
);

app.use("/v1", routes);

app.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post("/webhook", async (req, res) => {
    let data, eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data.object;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log("💰 Payment captured!");
    } else if (eventType === "payment_intent.payment_failed") {
        console.log("❌ Payment failed.");
    } else if (eventType == "invoice.payment_succeeded") {
        handlePaymentSuccess(data);
    }
    res.sendStatus(200);
});

app.listen(4242, () =>
    console.log(`Node server listening at http://localhost:4242`)
);
