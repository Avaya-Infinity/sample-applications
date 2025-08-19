/******************************************************************************
 * Avaya Signature Validation Middleware.
 * This middleware validates the signature of incoming requests from Avaya Infinity.
 * It ensures that the request is authentic and has not been tampered with.
 * The signature is validated using HMAC SHA256 with th webhook secret configured
 * as part of the connector configuration on Avaya Infinity Admin Console.
 ******************************************************************************/

import crypto from "crypto";
import { config } from "../config/environment.js";

export const validateAvayaSignature = (req, res, next) => {
  // Get the webhook secret from config
  const webhookSecret = config.avaya.webhookSecret;

  // If webhook secret is not configured, skip validation
  if (!webhookSecret || webhookSecret === "") {
    console.info(
      "Webhook secret not configured. Ignoring signature validation."
    );
    return next();
  }

  // Validate the signature received in the request headers
  // The header should be in the format: sha256=<HMAC>
  // where <HMAC> is the HMAC SHA256 of the request body
  // using the webhook secret as the key.
  const receivedHmac = req.headers["x-avaya-event-signature"];

  if (!receivedHmac?.startsWith("sha256=")) {
    console.error("Missing or invalid x-avaya-event-signature header");
    return res.status(401).json({
      error:
        "Unauthorized. Please provide a valid x-avaya-event-signature header",
    });
  }

  try {
    // Create HMAC SHA256 of the request body
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(req.body), 'utf8');
    const generatedHmac = "sha256=" + hmac.digest('base64');

    console.debug(`HMAC received: ${receivedHmac}, HMAC generated: ${generatedHmac}`);

    // Use timing-safe comparison with explicit encoding
    const receivedBuffer = Buffer.from(receivedHmac, 'utf8');
    const generatedBuffer = Buffer.from(generatedHmac, 'utf8');
    
    if (receivedBuffer.length !== generatedBuffer.length || 
        !crypto.timingSafeEqual(receivedBuffer, generatedBuffer)) {
      console.error("Invalid Avaya signature");
      return res
        .status(403)
        .json({ error: "Access Denied: Invalid signature" });
    }

    console.debug("Avaya signature validated successfully");
    next();
  } catch (error) {
    console.error("Error validating Avaya signature:", error.message);
    res.status(500).json({ error: "Error validating signature" });
  }
};
