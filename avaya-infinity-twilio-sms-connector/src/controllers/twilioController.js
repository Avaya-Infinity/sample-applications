/******************************************************************************
* Twilio Controller.
* This controller handles webhook events coming from Twilio.
* It processes incoming SMS messages and forwards them to Avaya Infinity.
******************************************************************************/

import avayaInfinityService from '../services/avayaInfinityService.js';
import { config } from '../config/environment.js';

export const handleTwilioWebhook = async (req, res) => {
  console.debug('---- Received event from Twilio ----');
  console.debug('Request headers:', req.headers);
  console.debug('Request body:', req.body);
  console.debug('------------------------------------');

  try {
    const twilioMessage = req.body;

    console.info('Received SMS from Twilio:', { From: twilioMessage.From, Body: twilioMessage.Body, MessageSid: twilioMessage.MessageSid });

    // Forward message to Avaya Infinity
    const message = {
      connectorId: config.avaya.connectorId,
      channel: 'SMS',
      headers: {
        from: twilioMessage.From,
        to: [twilioMessage.To],
        destination: twilioMessage.To
      },
      body: {
        text: twilioMessage.Body
      },
      contextParameters: {
        category: 'insurance',
        toCountryCode: twilioMessage.ToCountryCode,
        toState: twilioMessage.ToState,
        toCity: twilioMessage.ToCity,
        fromCountryCode: twilioMessage.FromCountryCode,
        fromState: twilioMessage.FromState,
        fromCity: twilioMessage.FromCity,
      },
      providerMetaData: {
        messageId: twilioMessage.MessageSid,
        messageTimestamp: new Date().toISOString()
      }
    };

    await avayaInfinityService.sendMessage(message);

    console.info(`Message ${twilioMessage.MessageSid} sent to Avaya Infinity successfully`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    res.status(500).send('Error processing webhook event from Twilio');
  }
};
