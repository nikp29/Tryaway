import express from 'express';
import { checkIfAuthenticated } from '../middleware/firebaseAuth.js';
import { createUser, deactivateUser } from '../controllers/users.js';

const router = express.Router();

router.post('/signup', checkIfAuthenticated, createUser); // create user DB instance, stripe customer ID, create stripe customer, create subscription
// update payment method
router.post('/activate', checkIfAuthenticated); // get cc number and return tokens
router.post('/deactivate', checkIfAuthenticated, deactivateUser); // suspend cards, suspend subscriptions, delete user

export default router;
