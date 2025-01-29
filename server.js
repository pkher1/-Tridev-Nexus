
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Utility function to encrypt data with AES
function encryptPayloadWithAESKey(encrypted_flow_data, encrypted_aes_key, initial_vector) {
    const cipher = crypto.createCipheriv("aes-256-cbc", encrypted_aes_key, initial_vector);
    let encrypted = cipher.update(encrypted_flow_data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
}



function decryptRSAKey(encryptedKey) {
    try {
        // Load private key
        const privateKey = crypto.createPrivateKey({
            key: fs.readFileSync("private.pem"),
            passphrase: "qwer",
        });

        // Decode the encrypted key
        const buffer = Buffer.from(encryptedKey, "base64");

        // Decrypt with proper padding
        const decryptedKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            buffer
        );

        console.log("Decrypted Key (Base64):", decryptedKey.toString("base64"));
        console.log("Decrypted Key Length:", decryptedKey.length);

        return decryptedKey;
    } catch (error) {
        console.error("Failed to decrypt RSA key:", error);
        throw error;
    }
}



// function decryptRSAKey(encryptedKey) {
//     try {
//         // Load private key
//         const privateKey = crypto.createPrivateKey({
//             key: fs.readFileSync("private.pem"),
//             passphrase: "qwer",
//         });

//         // Decode the encrypted key
//         const buffer = Buffer.from(encryptedKey, "base64");

//         // Decrypt with proper padding
//         const decryptedKey = crypto.privateDecrypt(
//             {
//                 // key: privateKey,
//                 // padding: crypto.constants.RSA_PKCS1_PADDING,
//                 key: privateKey,
//                 padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//                 oaepHash: "sha256", // Ensure it matches encryption settings
//             },
//             buffer
//         );

//         return decryptedKey;
//     } catch (error) {
//         console.error("Failed to decrypt RSA key:", error);
//         throw error;
//     }
// }

// Webhook endpoint
// app.post("/webhook", async (req, res) => {
//     try {
//         console.log("Incoming Request Body:", req.body);

//         const { encrypted_aes_key, initial_vector, encrypted_flow_data } = req.body;

//         // Validate required fields
//         if (!encrypted_aes_key || !initial_vector || !encrypted_flow_data) {
//             console.warn("Missing required fields");
//             return res.status(200).json({
//                 success: false,
//                 error: "Missing required fields (encrypted_aes_key, initial_vector, or encrypted_flow_data)",
//             });
//         }

//         // Decode AES key and IV
//         const decodedAESKey = Buffer.from(encrypted_aes_key, "base64");
//         const decodedIV = Buffer.from(initial_vector, "base64");

//         // Validate lengths
//         if (decodedAESKey.length !== 32) {
//             console.warn("Invalid AES key length");
//             return res.status(200).json({
//                 success: false,
//                 error: "Invalid AES key length. Expected 32 bytes.",
//             });
//         }

//         if (decodedIV.length !== 16) {
//             console.warn("Invalid IV length");
//             return res.status(200).json({
//                 success: false,
//                 error: "Invalid IV length. Expected 16 bytes.",
//             });
//         }

//         // Encrypt the payload
//         const encryptedPayload = encryptPayloadWithAESKey(
//             JSON.stringify(encrypted_flow_data),
//             decodedAESKey,
//             decodedIV
//         );

//         // Return the Base64-encoded encrypted payload
//         return res.status(200).json({
//             success: true,
//             encrypted_payload: encryptedPayload,
//         });
//     } catch (error) {
//         console.error("Error processing the webhook:", error);
//         return res.status(200).json({
//             success: false,
//             error: "Internal server error",
//             details: error.message,
//         });
//     }
// });


app.post("/webhook", async (req, res) => {
    try {
        console.log("Incoming Request Body:", req.body);

        const { encrypted_aes_key, initial_vector, encrypted_flow_data } = req.body;

        if (!encrypted_aes_key || !initial_vector || !encrypted_flow_data) {
            console.warn("Missing required fields");
            return res.status(200).json({
                success: false,
                error: "Missing required fields (encrypted_aes_key, initial_vector, or encrypted_flow_data)",
            });
        }

        // Decrypt the AES key
        const decryptedAESKey = decryptRSAKey(encrypted_aes_key);

        // Decode AES key and IV
        // const decodedAESKey = Buffer.from(encrypted_aes_key, "base64");
        const decodedIV = Buffer.from(initial_vector, "base64");

        // Log the lengths of the decoded values
        console.log("Decoded AES Key Length:", decryptedAESKey.length);
        console.log("Decoded IV Length:", decodedIV.length);

        console.log("Decoded AES Key (Base64):", encrypted_aes_key);
        console.log("Decoded IV (Base64):", initial_vector);



        // Validate lengths
        if (decryptedAESKey.length !== 32) {
            console.error("Decrypted AES key is not 256 bits:", decryptedAESKey.toString("base64"));
            return res.status(200).json({
                success: false,
                error: "Invalid decrypted AES key length. Expected 32 bytes.",
            });
        }

        if (decodedIV.length !== 16) {
            return res.status(200).json({
                success: false,
                error: "Invalid IV length. Expected 16 bytes.",
            });
        }

        // Encrypt the payload
        const encryptedPayload = encryptPayloadWithAESKey(
            JSON.stringify(encrypted_flow_data),
            decryptedAESKey,
            decodedIV
        );

        return res.status(200).json({
            success: true,
            encrypted_payload: encryptedPayload,
        });
    } catch (error) {
        console.error("Error processing the webhook:", error);
        return res.status(200).json({
            success: false,
            error: "Internal server error",
            details: error.message,
        });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});






// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(bodyParser.json());

// // Utility function to encrypt data with AES
// function encryptPayloadWithAESKey(encrypted_flow_data, encrypted_aes_key, initial_vector) {
//     const cipher = crypto.createCipheriv("aes-256-cbc", encrypted_aes_key, initial_vector);
//     let encrypted = cipher.update(encrypted_flow_data, "utf8", "base64");
//     encrypted += cipher.final("base64");
//     return encrypted;
// }

// // Webhook endpoint
// // app.post("/webhook", async (req, res) => {
// //     try {
// //         const { aes_key, iv, payload } = req.body;

// //         // Decode the AES key and IV from Base64
// //         const decodedAESKey = Buffer.from(aes_key, "base64");
// //         const decodedIV = Buffer.from(iv, "base64");

// //         // Encrypt the payload
// //         const encryptedPayload = encryptPayloadWithAESKey(
// //             JSON.stringify(payload),
// //             decodedAESKey,
// //             decodedIV
// //         );

// //         // Respond with the Base64-encoded encrypted payload
// //         res.status(200).json({ encrypted_payload: encryptedPayload });
// //     } catch (error) {
// //         console.error("Error processing the webhook:", error);
// //         res.status(500).send("Internal server error");
// //     }
// // });

// // app.post("/webhook", async (req, res) => {
// //     // try {
// //     //     console.log("Incoming Request Body:", req.body); // Log the request body
        
// //     //     const { aes_key, iv, payload } = req.body;

// //     //     if (!aes_key || !iv || !payload) {
// //     //         return res.status(400).json({ error: "Missing required fields (aes_key, iv, or payload)" });
// //     //     }

// //     //     // Decode the AES key and IV from Base64
// //     //     const decodedAESKey = Buffer.from(aes_key, "base64");
// //     //     const decodedIV = Buffer.from(iv, "base64");

// //     //     // Encrypt the payload
// //     //     const encryptedPayload = encryptPayloadWithAESKey(
// //     //         JSON.stringify(payload),
// //     //         decodedAESKey,
// //     //         decodedIV
// //     //     );

// //     //     // Respond with the Base64-encoded encrypted payload
// //     //     res.status(200).json({ encrypted_payload: encryptedPayload });
// //     // } catch (error) {
// //     //     console.error("Error processing the webhook:", error);
// //     //     res.status(500).send("Internal server error");
// //     // }

// //     try {
// //         console.log("Incoming Request Body:", req.body); // Log the request body
// //         const { aes_key, iv, payload } = req.body;
    
// //         if (!aes_key || !iv || !payload) {
// //             throw new Error("Missing required fields: aes_key, iv, or payload");
// //         }
    
// //         // Ensure aes_key and iv are valid Base64 strings
// //         if (!Buffer.from(aes_key, "base64").toString("base64") === aes_key) {
// //             throw new Error("Invalid AES key: must be a valid Base64 string");
// //         }
    
// //         if (!Buffer.from(iv, "base64").toString("base64") === iv) {
// //             throw new Error("Invalid IV: must be a valid Base64 string");
// //         }
    
// //         // Proceed with encryption
// //         const decodedAESKey = Buffer.from(aes_key, "base64");
// //         const decodedIV = Buffer.from(iv, "base64");
    
// //         const encryptedPayload = encryptPayloadWithAESKey(
// //             JSON.stringify(payload),
// //             decodedAESKey,
// //             decodedIV
// //         );
    
// //         res.status(200).json({ encrypted_payload: encryptedPayload });
// //     } catch (error) {
// //         console.error("Error processing the webhook:", error.message);
// //         res.status(400).json({ error: error.message });
// //     }
// // });

// app.post("/webhook", async (req, res) => {
//     try {
//         // Log incoming request for debugging
//         console.log("Incoming Request Body:", req.body);

//         const { encrypted_aes_key, initial_vector, encrypted_flow_data } = req.body;

//         // Validate required fields
//         if (!encrypted_aes_key || !initial_vector || !encrypted_flow_data) {
//             console.warn("Missing required fields (encrypted_aes_key, initial_vector, or encrypted_flow_data)");
//             return res.status(200).json({
//                 success: false,
//                 error: "Missing required fields (encrypted_aes_key, initial_vector, or encrypted_flow_data)",
//             });
//         }

//         // Decode AES key and IV
//         const decodedAESKey = Buffer.from(encrypted_aes_key, "base64");
//         const decodedIV = Buffer.from(initial_vector, "base64");

//         // Encrypt the encrypted_flow_data
//         const encryptedPayload = encryptPayloadWithAESKey(
//             JSON.stringify(encrypted_flow_data),
//             decodedAESKey,
//             decodedIV
//         );

//         // Return the encrypted encrypted_flow_data
//         return res.status(200).json({
//             success: true,
//             encrypted_payload: encryptedPayload,
//         });
//     } catch (error) {
//         console.error("Error processing the webhook:", error);

//         // Return a 200 status code with an error message in the body
//         return res.status(200).json({
//             success: false,
//             error: "Internal server error",
//             details: error.message,
//         });
//     }
// });



// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });