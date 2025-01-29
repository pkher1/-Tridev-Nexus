// const express = require("express");
// const bodyParser = require("body-parser");
// const { getNextScreen } = require("./flow.js");
// const crypto = require("crypto");
// const fs = require("fs");

import express from 'express';
import bodyParser from 'body-parser';
import getNextScreen  from './flow.js';
import crypto from 'crypto';
import fs from 'fs';

const PORT = 3000;
const app = express();
const APP_SECRET = "ce43b271bbb93da9d1a42506ae72b403";
const WEBHOOK_VERIFY_TOKEN = "zxcvasdf123";
// app.use(express.json());

// Define FlowEndpointException early in the code
export class FlowEndpointException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

app.use(
  express.json({
    // store the raw request body to use it for signature verification
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf?.toString(encoding || "utf8");
    },
  })
);

// Load private key
const PRIVATE_KEY = crypto.createPrivateKey({
  key: fs.readFileSync("private.pem"),
  passphrase: "qwer",
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

// const axios = require('axios');

// // Webhook handler to process incoming messages
// const handleWebhook = async (req, res) => {
//   try {
//     const webhookPayload = req.body;
//     console.log("Received Webhook Payload:", webhookPayload);

//     // Check if the webhook contains the expected structure
//     if (webhookPayload.messages && webhookPayload.messages.length > 0) {
//       const messageData = webhookPayload.messages[0];
//       const responseJson = JSON.parse(messageData.interactive.nfm_reply.response_json);

//       const { flow_token, optional_param1, optional_param2 } = responseJson;

//       // Process the flow token and optional parameters
//       console.log("Flow Token:", flow_token);
//       console.log("Optional Params:", optional_param1, optional_param2);

//       // Send a summary message to WhatsApp (you can modify this to send any desired message)
//       const summaryMessage = `
//         Flow completed successfully!
//         Flow Token: ${flow_token}
//         Optional Param 1: ${optional_param1}
//         Optional Param 2: ${optional_param2}
//       `;

//       // Manually trigger the summary message
//       await sendWhatsAppMessage(messageData.context.from, summaryMessage);

//       // Respond with a success message
//       res.status(200).json({ message: "Webhook processed successfully" });
//     } else {
//       throw new Error("Invalid webhook payload");
//     }
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     res.status(500).json({ message: "Error processing webhook", error: error.message });
//   }
// };

// // Function to send a WhatsApp message (manually triggered)
// const sendWhatsAppMessage = async (to, message) => {
//   try {
//     const whatsappApiUrl = "<YOUR_WHATSAPP_API_URL>"; // Replace with the WhatsApp API URL
//     const apiKey = "<YOUR_API_KEY>"; // Replace with your API key

//     const payload = {
//       to,
//       message,
//       type: "text", // Assuming text message type for simplicity
//     };

//     const headers = {
//       Authorization: `Bearer ${apiKey}`,
//     };

//     const response = await axios.post(whatsappApiUrl, payload, { headers });

//     if (response.status === 200) {
//       console.log("Message sent to WhatsApp successfully!");
//     } else {
//       throw new Error("Failed to send WhatsApp message");
//     }
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//   }
// };

// // Mocking a test to trigger the webhook handler
// const testWebhook = async () => {
//   const mockWebhookPayload = {
//     messages: [{
//       context: {
//         from: "16315558151",
//         id: "gBGGEiRVVgBPAgm7FUgc73noXjo"
//       },
//       from: "<USER_ACCOUNT_NUMBER>",
//       id: "<MESSAGE_ID>",
//       type: "interactive",
//       interactive: {
//         type: "nfm_reply",
//         nfm_reply: {
//           name: "flow",
//           body: "Sent",
//           response_json: "{\"flow_token\": \"<FLOW_TOKEN>\", \"optional_param1\": \"<value1>\", \"optional_param2\": \"<value2>\"}"
//         }
//       },
//       timestamp: "<MESSAGE_SEND_TIMESTAMP>"
//     }]
//   };

//   // Simulate webhook request processing
//   await handleWebhook({ body: mockWebhookPayload }, {
//     status: (statusCode) => {
//       console.log(`Status Code: ${statusCode}`);
//       return { json: (message) => console.log(message) };
//     }
//   });
// };

// // Run the test (you can comment this out in production)
// testWebhook();

// module.exports = { handleWebhook, sendWhatsAppMessage };

app.post("/webhook", async ({ body }, res) => {
  console.log("Incoming Request Body:", body);

  if (!PRIVATE_KEY) {
    throw new Error(
      'Private key is empty. Please check your env variable "PRIVATE_KEY".'
    );
  }

  //   if (!isRequestSignatureValid(body)) {
  //     // Return status code 432 if request signature does not match.
  //     // To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
  //     return res.status(432).send();
  //   }

  if (body.entry && body.entry[0] && body.entry[0].changes) {
    // Process status change or other event
    const eventChanges = body.entry[0].changes;
    eventChanges.forEach((change) => {
      console.log("Change detected:", change);
      // Handle flow status change or message status change here
    });

    // Respond to webhook request
    res.status(200).send("Event received successfully.");
  }

  const payload = body;
  

//   if (payload.messages) {
//     payload.messages.forEach(async (message) => {
//       console.log("====================================");
//       console.log(message);
//       console.log("====================================");
//       if (
//         message.type === "interactive" &&
//         message.interactive?.type === "nfm_reply"
//       ) {
//         const flowToken = JSON.parse(
//           message.interactive.nfm_reply.response_json
//         ).flow_token;
//         const userNumber = message.from;

//         // Respond to data exchange
//         // const flowResponse = triggerFlowCompletion(flowToken, {
//         //   optional_param1: "value1",
//         //   optional_param2: "value2"
//         // });
//         // res.status(200).send(flowResponse);

//         // // Send summary message
//         // const summaryMessage = "Thank you for completing the flow! We will get back to you shortly.";
//         // await sendSummaryMessage(userNumber, summaryMessage);
//       }
//     });
//   } else {
//     res.status(400).send("No messages in webhook payload");
//   }

  let decryptedRequest = null;
  try {
    decryptedRequest = decryptRequest(body, PRIVATE_KEY);
  } catch (err) {
    console.error(err);
    if (err instanceof FlowEndpointException) {
      return res.status(err.statusCode).send();
    }
    return res.status(500).send();
  }

  const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
  console.log("💬decryptedBody👉:", decryptedBody);

  // TODO: Uncomment this block and add your flow token validation logic.
  // If the flow token becomes invalid, return HTTP code 427 to disable the flow and show the message in `error_msg` to the user
  // Refer to the docs for details https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes

  /*
  if (!isValidFlowToken(decryptedBody.flow_token)) {
    const error_response = {
      error_msg: `The message is no longer available`,
    };
    return res
      .status(427)
      .send(
        encryptResponse(error_response, aesKeyBuffer, initialVectorBuffer)
      );
  }
  */

  const screenResponse = await getNextScreen(decryptedBody);
  console.log("👉 Response to Encrypt:", screenResponse);
  res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
});

const decryptRequest = (body, privateKey) => {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

  if (!encrypted_aes_key || !encrypted_flow_data || !initial_vector) {
    throw new FlowEndpointException(
      400,
      "Missing required encryption fields in request body"
    );
  }
  let decryptedAesKey = null;
  try {
    // decrypt AES key created by client
    decryptedAesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encrypted_aes_key, "base64")
    );
  } catch (error) {
    console.error(error);
    /*
        Failed to decrypt. Please verify your private key.
        If you change your public key. You need to return HTTP status code 421 to refresh the public key on the client
        */
    throw new FlowEndpointException(
      421,
      "Failed to decrypt the request. Please verify your private key."
    );
  }

  // Decrypt the Flow data
  const flowDataBuffer = Buffer.from(encrypted_flow_data, "base64");
  const initialVectorBuffer = Buffer.from(initial_vector, "base64");

  const TAG_LENGTH = 16;
  const encrypted_flow_data_body = flowDataBuffer.subarray(0, -TAG_LENGTH);
  const encrypted_flow_data_tag = flowDataBuffer.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    "aes-128-gcm",
    decryptedAesKey,
    initialVectorBuffer
  );
  decipher.setAuthTag(encrypted_flow_data_tag);

  const decryptedJSONString = Buffer.concat([
    decipher.update(encrypted_flow_data_body),
    decipher.final(),
  ]).toString("utf-8");

  return {
    decryptedBody: JSON.parse(decryptedJSONString),
    aesKeyBuffer: decryptedAesKey,
    initialVectorBuffer,
  };
};

const encryptResponse = (response, aesKeyBuffer, initialVectorBuffer) => {
  // Flip the initialization vector
  const flipped_iv = [];
  for (const pair of initialVectorBuffer.entries()) {
    flipped_iv.push(~pair[1]);
  }
  // Encrypt the response data
  const cipher = crypto.createCipheriv(
    "aes-128-gcm",
    aesKeyBuffer,
    Buffer.from(flipped_iv)
  );
  return Buffer.concat([
    cipher.update(JSON.stringify(response), "utf-8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]).toString("base64");
};

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
  Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});

// function isRequestSignatureValid(req) {
//   if (!APP_SECRET) {
//     console.warn(
//       "App Secret is not set up. Please Add your app secret in /.env file to check for request validation"
//     );
//     return true;
//   }

//   const signatureHeader = req.get("x-hub-signature-256");
//   const signatureBuffer = Buffer.from(
//     signatureHeader.replace("sha256=", ""),
//     "utf-8"
//   );

//   const hmac = crypto.createHmac("sha256", APP_SECRET);
//   const digestString = hmac.update(req.rawBody).digest("hex");
//   const digestBuffer = Buffer.from(digestString, "utf-8");

//   if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
//     console.error("Error: Request Signature did not match");
//     return false;
//   }
//   return true;
// }
