import { firebase } from "../config/firebase.js";

const getUser = async (uuid: string) => {
    const usersRef = firebase.firestore().collection("users");
    const user = await usersRef.doc(uuid).get();
    return user.data();
};

const updateUser = async (uuid: string, data: any) => {
    const usersRef = firebase.firestore().collection("users");
    await usersRef.doc(uuid).update(data);
};

const getStripeCustomer = async (
    stripeCustId: string
) => {
    const stripeRef = firebase.firestore().collection("stripe");
    const customer = await stripeRef.doc(stripeCustId).get();
    return customer.data();
};

const setUser = async (uuid: string, data: any) => {
    const usersRef = firebase.firestore().collection("users");
    await usersRef.doc(uuid).set(data);
};

const setStripeCustomer = async (stripeCustId: string, uuid: string) => {
    const stripeRef = firebase.firestore().collection("stripe");
    await stripeRef.doc(stripeCustId).set({ uuid });
};

export { getUser, getStripeCustomer, setStripeCustomer, setUser, updateUser };
