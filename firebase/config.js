var firebase = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

firebase.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export { firebase };
