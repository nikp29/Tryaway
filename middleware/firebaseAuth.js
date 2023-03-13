import { firebase } from "../firebase/config.js";

const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        req.authToken = req.headers.authorization.split(" ")[1];
    } else {
        req.authToken = null;
    }
    next();
};

const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await firebase.auth().verifyIdToken(authToken);
            req.authId = userInfo.uid;
            req.email = userInfo.email;
            return next();
        } catch (e) {
            return res
                .status(401)
                .send({ error: "You are not authorized to make this request" });
        }
    });
};

export { checkIfAuthenticated };
