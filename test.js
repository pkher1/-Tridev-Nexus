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
import fetch from 'node-fetch';
import ZohoAPIClient from './zoho.js';

const PORT = 3000;
const app = express();
const APP_SECRET = "ce43b271bbb93da9d1a42506ae72b403";
const WEBHOOK_VERIFY_TOKEN = "zxcvasdf123";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAGTLPz6kJABO7BZCzcfbVbO0AgGVxsSsZBoK20GL5t2SQCrSMHbYnzTe5daU6ZA6r6HINudZBgSijJthRV7TU0vkYMPLRgHYkV8Q8ZCIgTAmC5fpo5ZAwjHzrG4xZBAW8hc6jbK1NnhATPHozMM5SIVxz0Szx3jZBbzc4ROnGResFTThbKs6blLISrCb2UFohwXigZDZD";
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

// Function to send a WhatsApp message
const sendWhatsAppMessage = async (to, message, phoneNumberId) => {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
};

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

  // Check if this is a Flow request (encrypted) or a webhook notification
  if (body.encrypted_aes_key && body.encrypted_flow_data && body.initial_vector) {
    // Handle encrypted Flow request
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

    // TODO: Flow token validation logic can be added here if needed
    const screenResponse = await getNextScreen(decryptedBody);
    console.log("👉 Response to Encrypt:", screenResponse);
    return res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
  }

  // Handle webhook notification (when Flow is completed)
  if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const message = body.entry[0].changes[0].value.messages[0];
    console.log("Processing webhook message:", message);
    
    if (message.type === "interactive" && message.interactive?.type === "nfm_reply") {
      try {
        // Extract the response data
        const responseData = message.interactive.nfm_reply;
        console.log("Flow response data:", responseData);

        // If there's no response_json, this might be a different type of interaction
        if (!responseData.response_json) {
          return res.status(200).send("OK");
        }

        // Parse the response JSON
        const flowData = JSON.parse(responseData.response_json);
        console.log("Parsed flow data:", flowData);

        // Extract customer data from the nested structure
        const customerData = flowData.customer_data;
        
        // Construct the data exchange request
        const exchangeRequest = {
          action: "data_exchange",
          screen: "screen_irbhvz",
          data: {
            screen_1_MFY_0: customerData.screen_1_MFY_0,
            screen_1_Kms_Driven_1: customerData.screen_1_Kms_Driven_1,
            screen_1_Select_Date_3: customerData.screen_1_Select_Date_3,
            screen_1_Time_Slot_4:customerData.screen_1_Time_Slot_4,
            screen_0_First_Name_0: customerData.screen_0_First_Name_0,
            screen_0_Phone_Number_2: message.from,
            screen_0_Pincode_3: customerData.screen_0_Pincode_3,
            screen_0_Registration_Number_3: customerData.screen_0_Registration_Number_3,
            screen_0_Brand_4: customerData.screen_0_Brand_4,
          },
          flow_token: flowData.flow_token
        };

        console.log("Data exchange request:", exchangeRequest);

        // Create lead in Zoho CRM
        const zohoClient = new ZohoAPIClient();
        const leadId = await zohoClient.createLead(exchangeRequest.data);
        console.log("Zoho CRM Lead created successfully with ID:", leadId);

        // Get the phone number ID from the webhook message metadata
        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
        
        // Send the summary message using WhatsApp API
        await sendWhatsAppMessage(
          message.from,
          `Thanks! Got your details—our team will get in touch with you soon to confirm your home inspection. ⚡`,
          phoneNumberId
        );

        // Return success response
        return res.status(200).json({
          success: true,
          message: "Summary message sent successfully"
        });

      } catch (error) {
        console.error("Error processing flow completion:", error);
        return res.status(500).json({
          success: false,
          error: "Error processing flow completion",
          details: error.message
        });
      }
    }
  }

  // For any other webhook events, return 200 OK
  return res.status(200).send("OK");
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
