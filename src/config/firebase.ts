import admin from 'firebase-admin';
import serviceAccount from '../firebasekey.js';

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export { firebase };
