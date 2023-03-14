import { Request } from "express";

interface IWebhookReqMessage extends Request {
    rawBody: any
}

interface IAuthorizedRouteReq extends Request {
    authId: string
    email: string
}

export { IWebhookReqMessage, IAuthorizedRouteReq };
