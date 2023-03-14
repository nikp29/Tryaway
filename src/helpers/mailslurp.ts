import { MailSlurp } from 'mailslurp-client';
import { CreateInboxForwarderOptionsFieldEnum } from 'mailslurp-client';
import { updateUser } from './firebase.js';

const mailslurp = new MailSlurp({ apiKey: process.env.MAILSLURP_KEY });

const createInbox = async (uuid: string, userEmail: string) => {
  const inbox = await mailslurp.createInbox(); // { id: '123', emailAddress: '123@mailslurp.com' }
  await mailslurp.inboxForwarderController.createNewInboxForwarder({
    // attach rule to inbox 2
    inboxId: inbox.id,
    createInboxForwarderOptions: {
      // filter emails that match the sender from inbox 1 and send to inbox 3
      field: CreateInboxForwarderOptionsFieldEnum.SENDER,
      match: '*',
      forwardToRecipients: [userEmail]
    }
  });
  await updateUser(uuid, {
    mailslurp_id: inbox.id,
    proxy_email: inbox.emailAddress
  });
};
