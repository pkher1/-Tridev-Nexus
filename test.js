const express = require("express");
const bodyParser = require("body-parser");
const { getNextScreen } = require("./flow.js");
const crypto = require("crypto");
const fs = require("fs");

const PORT = 3000;
const app = express();
const APP_SECRET = 'ce43b271bbb93da9d1a42506ae72b403';
// app.use(express.json());

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

// const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
// Proc-Type: 4,ENCRYPTED
// DEK-Info: DES-EDE3-CBC,0089550262375C94

// gpdQ4TQcpfj7AbKq2Z2nwU9bhGFDj1haYJITsntic4vVZ+7qpzT153XQdK3x6gTX
// 0sz3YMHZCLX5sAGGHWqng4UydKbwIs3LkGen/z07gL/16zBWAt8p48OwVQdF+TPS
// 8AGAL0xK3aPssr8WhtSAuI9DYCQWKkWiMbNpnzh8exLZ3hPVXFhQIbeKm9lA2p8U
// o+TM1m5cQslygOZlQn1PTRoPOrlyIwQSA8fluAA8dE5iAE3UOd6UT1nig3q9wRDr
// zXCiZyAZYfGfC0AWSVsOXUHzWKET0jnpe5UFY/yAdVsBxmzPkZ2iXzGA9hjNyJUS
// ZlX6GAHooK2GebDIUN0UuHRBdA187CPVTl57KZhsqojp1up6O1uJe/p8lamHUwN8
// 7+9In0NuyIFP2GT1Esvo2QGlXRsnZIQePU3TTaLYnbJBJcr/NW7qmEG3jOT2JE4X
// VQ/Cne0mYQU/XJAodzEbrSR3IYBIZMpVgZPut46lXTsutYe7qfSAlzBYNLPFEjMY
// Q/fS5jk7bIJWMj82cW4WXUuT/n1V9UqnK6qIUOIuCSHbd+VBFHH1sPQ4RCYNFAkU
// Nqd+QXYsml95fO/nsnrmJp4P/wRv/MXok2xOv6KvVlpFgRmSW86HIJQyqPYQDUcP
// +56ijxbTvBe9KDbpLTMgZh1+HxAMTS6tMzjFl5sihHVFMjNUhfLrMqcjyRncnQ4m
// dG+WGaCbesGUEtEgDk3lPFb6P/7QYdZkSBamQFXwExUhEbiUL+txO9bJgyhbgf0e
// rsKtcKn2YHjBZROJBRfNqlpDOFrcqWdXC1QcCmLzdEe/OV2HTbhU1hJb5AuDkGr1
// pyuaMhuvtsCVC7lp1F00YVQnHPyEKu8mGAPNSXCYjbJfxHHBmz/MLTtjPJ/t+eZG
// VOcF3QjwMUASUAD8jklKPxXksByAt9pFPV+q4IcPuYT0qeyklVHclmg7mi22Ghgj
// vJfG9DoB7rtwRKMSCStlL8juabyZxQQY1d66M9FnTrH0do3GYKg0xYgSzVgvJ6gB
// F++vxgjS2mmrin00Ms+ikbB2OzqX87GrL1wUpW3p3MYN04Bugx3FSjugboY9m7YE
// 9FO+uIutxl+BMK7GP6HArppoMc+im59/Z3UJcjASeYoZDxTsWj3omDDqx+NKLDPA
// sqmQryKMQONNdkM42GjIN1FgzoGQXCGSGosNFlLZpecAnSmN+c8HZuKYFqweSjBB
// +hGIEMZ4K/LdaCPR/XhE/RNhUv/AXMsklnjdcVMXcq3zuKCzX+TFgZEbEj1G+IUn
// Os5XeYID79YqqtKXdr1cly+zkwezd7gM4CqhBT9z2tFrQQO0IOxPwl0nxBe2z3Aj
// 257HeGBpPGGxfg2M6N5I9vhbuOFhbHtKLnz4QuocgWN2Mmr79AxvguPN4p1OB1Lr
// UOKXrdeLMmQjdRCWDSSQWjtWSmkzBXyUHcBLYspcSkktFNNieBvGd7gGZxW10adW
// JFo3aqiDAz+DpGTme0M8VSWb81EM/CpdHIl/FsT07UTMvXTk2x0BS7kPiheWhLeQ
// HoWQROaU+gS8R4sSrDViN6poKEx4bK5J+HJJaVgvtBaM71c1W2sW7eqCrcJ3s+O4
// -----END RSA PRIVATE KEY-----`;

/* 
Example:
```-----BEGIN RSA PRIVATE KEY-----
MIIE...
...
...AQAB
-----END RSA PRIVATE KEY-----```
*/

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

  //   const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(
  //     body,
  //     PRIVATE_KEY,
  //   );
  //   console.log("decryptedBody-------->>>:", decryptedBody);

  //   const { screen, data, version, action } = decryptedBody;

  //   const screenData = {
  //     screen: "SCREEN_NAME",
  //     data: {
  //       some_key: "some_value",
  //     },
  //   };
  // handle health check request
  //   if (action === "ping") {
  //     return {
  //       data: {
  //         status: "active",
  //       },
  //     };
  //   }

  // handle initial request when opening the flow
  // if (action === "INIT") {
  //     return {
  //       screen: "RECOMMEND",
  //       title: "Feedback 1 of 2",
  //       data: {},
  //       layout: {
  //           "type": "SingleColumnLayout",
  //           "children": [
  //             {
  //               "type": "Form",
  //               "name": "form",
  //               "children": [
  //                 {
  //                   "type": "TextSubheading",
  //                   "text": "Would you recommend us to a friend?"
  //                 },
  //                 {
  //                   "type": "RadioButtonsGroup",
  //                   "label": "Choose one",
  //                   "name": "Choose_one",
  //                   "data-source": [
  //                     {
  //                       "id": "0_Yes",
  //                       "title": "Yes"
  //                     },
  //                     {
  //                       "id": "1_No",
  //                       "title": "No"
  //                     }
  //                   ],
  //                   "required": true
  //                 },
  //                 {
  //                   "type": "TextSubheading",
  //                   "text": "How could we do better?"
  //                 },
  //                 {
  //                   "type": "TextArea",
  //                   "label": "Leave a comment",
  //                   "required": false,
  //                   "name": "Leave_a_comment"
  //                 },
  //                 {
  //                   "type": "Footer",
  //                   "label": "Continue",
  //                   "on-click-action": {
  //                     "name": "navigate",
  //                     "next": {
  //                       "type": "screen",
  //                       "name": "RATE"
  //                     },
  //                     "payload": {
  //                       "screen_0_Choose_one_0": "${form.Choose_one}",
  //                       "screen_0_Leave_a_comment_1": "${form.Leave_a_comment}"
  //                     }
  //                   }
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //     };
  //   }

  //   initBody = {
  //     "screen": "RECOMMEND",
  //     "id": "RECOMMEND",
  //     "title": "Feedback 1 of 2",
  //     "data": {},
  //     "layout": {
  //       "type": "SingleColumnLayout",
  //       "children": [
  //         {
  //           "type": "Form",
  //           "name": "form",
  //           "children": [
  //             {
  //               "type": "TextSubheading",
  //               "text": "Would you recommend us to a friend?"
  //             },
  //             {
  //               "type": "RadioButtonsGroup",
  //               "label": "Choose one",
  //               "name": "Choose_one",
  //               "data-source": [
  //                 {
  //                   "id": "0_Yes",
  //                   "title": "Yes"
  //                 },
  //                 {
  //                   "id": "1_No",
  //                   "title": "No"
  //                 }
  //               ],
  //               "required": true
  //             },
  //             {
  //               "type": "TextSubheading",
  //               "text": "How could we do better?"
  //             },
  //             {
  //               "type": "TextArea",
  //               "label": "Leave a comment",
  //               "required": false,
  //               "name": "Leave_a_comment"
  //             },
  //             {
  //               "type": "Footer",
  //               "label": "Continue",
  //               "on-click-action": {
  //                 "name": "navigate",
  //                 "next": {
  //                   "type": "screen",
  //                   "name": "RATE"
  //                 },
  //                 "payload": {
  //                   "screen_0_Choose_one_0": "${form.Choose_one}",
  //                   "screen_0_Leave_a_comment_1": "${form.Leave_a_comment}"
  //                 }
  //               }
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   }

  //   Return the next screen & data to the client

  // resultBody ={"data": {"status": "active"}}
  // Return the response as plaintext
  res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
});

const decryptRequest = (body, privateKey) => {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

//   const privateKey = crypto.createPrivateKey({ key: privateKey });
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

  // // Decrypt the AES key created by the client
  // const decryptedAesKey = crypto.privateDecrypt(
  //   {
  //     key: privateKey,
  //     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  //     oaepHash: "sha256",
  //   },
  //   Buffer.from(encrypted_aes_key, "base64")
  // );

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


module.exports.FlowEndpointException = class FlowEndpointException extends Error {
  constructor(statusCode, message) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
};

// app.get("/", (req, res) => {
//     res.send(`<pre>Nothing to see here.
//   Checkout README.md to start.</pre>`);
//   });

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
