import { firebase } from "../config/firebase.js";
import { RequestHandler } from "express";
import { IAuthorizedRouteReq } from "../definitionfile";

const checkIfAuthenticated: RequestHandler = async (req: IAuthorizedRouteReq, res, next) => {
    let authToken = "";
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        authToken = req.headers.authorization.split(" ")[1];
    } else {
        authToken = null;
    }
    try {
        const userInfo = await firebase.auth().verifyIdToken(authToken);
        req.authId = userInfo.uid;
        req.email = userInfo.email;
        return next();
    } catch (e) {
        return res
            .status(401)
            .send({ error: "You are not authorized to make this request" });
    }
};

export { checkIfAuthenticated };
