import { initializeApp } from "firebase-admin/app";
import serviceAccount from "../firebasekey.js";
import admin from "firebase-admin";

const firebase = initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export { firebase };
