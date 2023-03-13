import express from "express";
import { checkIfAuthenticated } from "../middleware/firebaseAuth";
import { createUser } from "../controllers/users";

var router = express.Router();

router.post("/signup", checkIfAuthenticated, createUser); // create user DB instance, stripe customer ID, create stripe customer, create subscription
router.post("/activate", checkIfAuthenticated); // get cc number and return tokens
router.post("/deactivate", checkIfAuthenticated); // suspend cards, suspend subscriptions, delete user

export default router;
