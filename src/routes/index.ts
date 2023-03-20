import express from 'express';
import { checkIfAuthenticated } from '../middleware/firebaseAuth.js';
import {
  activateAccount,
  createUser,
  paymentMethodID,
  deactivateUser,
  setAddress,
  updateSubscription,
  userHasPaid
} from '../controllers/users.js';

const router = express.Router();

router.post('/signup', checkIfAuthenticated, createUser); // create user DB instance, stripe customer ID, create stripe customer, create subscription
router.get('/userhaspaid', checkIfAuthenticated, userHasPaid); // check if user has paid')
router.post('/updatesubscription', checkIfAuthenticated, updateSubscription);
router.post('/setAddress', checkIfAuthenticated, setAddress);
router.get('/paymentMethodID', checkIfAuthenticated, paymentMethodID); // get stripe customer ID for user
// update payment method
router.post('/activate', checkIfAuthenticated, activateAccount); // get cc number and return tokens
router.post('/deactivate', checkIfAuthenticated, deactivateUser); // suspend cards, suspend subscriptions, delete user

export default router;
