/******************************************************************************
* Avaya Infinity Controller.
* This controller handles webhook events comming from Avaya Infinity.
* It handles two types of events:
* 1. Health status event
*    Avaya Infinity sends health status events to test the webhook status
*    of the connector. We will respond with a 200 OK status to acknowledge
*    the health check.
* 2. Messages events
*    Avaya Infinity sends message events when a new message is received.
*    If the connector was configured to be subscribed to 'MESSAGES', 
*    the connector will receive message events sent by all participants
*    including the messages sent by customers. Instead, if the connector
*    was configured to be subscribed to 'CC_MESSAGES', it will only receive
*    messages sent by the Contact Center (agents, system/workflow or bots).
*    The connector will forward the message to Twilio, if the sender is not
*    the customer.
******************************************************************************/

import twilioService from '../services/twilioService.js';

export const handleAvayaWebhook = async (req, res) => {
  const { headers, body } = req;

  console.debug('---- Received event from Avaya Infinity ----');
  console.debug('Request headers:', headers);
  console.debug('Request body:', body);
  console.debug('--------------------------------------------');

  switch (body.eventType) {
    case 'HEALTH_CHECK':
      // Simply acknowledge health check events
      console.info('Received health check event from Avaya Infinity');
      return res.status(200).send('OK');

    case 'MESSAGES': {
      // Handle message event comming from Avaya Infinity
      const from = body.headers.from;
      const to = body.headers.to[0];
      const message = body.body.text;
      const senderType = body.sender.type;
      const messageId = body.messageId;
      
      console.info('Received message from Avaya Infinity:', { messageId, from, to, senderType });

      // If the sender is customer, simply acknowledge the event
      if (senderType === 'CUSTOMER') {
        console.info('Ignoring message from customer:', { messageId, from, to });
        return res.status(200).send('OK');
      }

      // If the sender is not customer, forward the message to Twilio
      try {
        await twilioService.sendMessage(from, to, message);

        console.info(`Message ${messageId} forwarded to Twilio successfully`);
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error processing Avaya Infinity webhook:', error);
        res.status(500).json({ error: 'Error processing webhook event from Avaya Infinity' });
      }
      break;
    }

    default:
      // Simply acknowledge any other events we may receive in the future
      console.info(`Ignoring event: ${body.eventType}`);
      return res.status(200).send('OK');
  }
};


