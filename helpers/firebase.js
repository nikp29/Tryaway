import { firebase } from "../config/firebase.js";

const getUser = async (uuid) => {
    const usersRef = firebase.firestore().collection("users");
    const user = await usersRef.doc(uuid).get();
    return user.data();
};

const updateUser = async (uuid, data) => {
    const usersRef = firebase.firestore().collection("users");
    await usersRef.doc(uuid).update(data);
};

const getStripeCustomer = async (stripe_cust_id) => {
    const stripeRef = firebase.firestore().collection("stripe");
    const customer = await stripeRef.doc(stripe_cust_id).get();
    return customer.data();
};

const setUser = async (uuid, data) => {
    const usersRef = firebase.firestore().collection("users");
    await usersRef.doc(uuid).set(data);
};

const setStripeCustomer = async (stripe_cust_id, uuid) => {
    const stripeRef = firebase.firestore().collection("stripe");
    await stripeRef.doc(stripe_cust_id).set({ uuid });
};

export { getUser, updateUser, getStripeCustomer };
