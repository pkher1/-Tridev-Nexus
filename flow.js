// import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-2.0";

// const { USDataCenter, InitializeBuilder } = require("@zohocrm/nodejs-sdk");

// import { USDataCenter, InitializeBuilder } from "@zohocrm/nodejs-sdk";

// async function initializeZohoCRM() {
//     const config = new InitializeBuilder()
//         .clientId("1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD")
//         .clientSecret("9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c")
//         .refreshToken(
//           "1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c"
//         )
//         // .redirectURL("YOUR_REDIRECT_URL")
//         .environment(USDataCenter.PRODUCTION())
//         .build();

//     await config.initialize();
// }

// import ZohoCRM from "@zohocrm/nodejs-sdk";
// const { USDataCenter, InitializeBuilder } = ZohoCRM;

// async function initializeZohoCRM() {
//   try {
//       const builderInstance = new InitializeBuilder()
//           .environment(USDataCenter.PRODUCTION())
//           .clientId("1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD")
//           .clientSecret("9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c")
//           .refreshToken("1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c");
//           // Optional: Add redirectURL if applicable
          
//       await builderInstance.initialize();
//       console.log("Zoho CRM SDK initialized successfully");
//   } catch (error) {
//       console.error("Error initializing Zoho CRM SDK:", error);
//   }
// }

// initializeZohoCRM();

// import ZohoCRM from "@zohocrm/nodejs-sdk";

// console.log('zcrm=====>',ZohoCRM);
// console.log('intialBuilder ---->',ZohoCRM.InitializeBuilder);

// async function initializeZohoCRM() {
//   // try {

//   //   console.log('ZohoCRM object:', ZohoCRM);
//   //     // Initialize the CRM using the 'Initializer' class
//   //     const zohoCRM = new ZohoCRM.Initializer({
//   //         clientId: "1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD",
//   //         clientSecret: "9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c",
//   //         refreshToken: "1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c",
//   //         environment: 'https://crm.zoho.com/org751595265',
//   //     });

//   //     // Initialize the Zoho CRM SDK
//   //     // await zohoCRM.initializeSDK();
//   //     // await zohoCRM.initialize();
//   //     console.log("Zoho CRM SDK initialized successfully");
//   // } catch (error) {
//   //     console.error("Error initializing Zoho CRM SDK:", error);
//   // }

//   try {
//     console.log('ZohoCRM object:', ZohoCRM);

//     // Initialize the SDK using InitializeBuilder
//     const config = new ZohoCRM.InitializeBuilder()
//       .clientId("1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD")
//       .clientSecret("9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c")
//       .refreshToken("1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c")
//       .environment("https://crm.zoho.com/org751595265")
//       .initialize();

//     console.log("Zoho CRM SDK initialized successfully");
//   } catch (error) {
//     console.error("Error initializing Zoho CRM SDK:", error);
//   }
// }

// initializeZohoCRM();


// async function initializeZohoCRM() {
//   const config = new InitializeBuilder()
//       .initialize({
//           clientId: "1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD",
//           clientSecret: "9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c",
//           refreshToken: "1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c",
//           environment: USDataCenter.PRODUCTION(),
//       });

//   await config;
//   console.log("Zoho CRM SDK initialized successfully");
// }

// const initializeZohoCRM = async () => {
//   const environment = ZOHOCRMSDK.USDataCenter.PRODUCTION();
//   const token = new ZOHOCRMSDK.OAuthBuilder()
//     .clientId("1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD") // Replace with your client ID
//     .clientSecret("9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c") // Replace with your client secret
//     .refreshToken(
//       "1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c"
//     ) // Replace with your refresh token
//     .build();

//   try {
//     await new ZOHOCRMSDK.InitializeBuilder()
//       .environment(environment)
//       .token(token)
//       .initialize();
//     console.log("Zoho CRM SDK initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing Zoho CRM SDK:", error);
//     throw error; // Propagate error for higher-level handling
//   }
// };


// const initializeZohoCRM = async () => {
//   const environment = ZOHOCRMSDK.USDataCenter.PRODUCTION();
//   const token = new ZOHOCRMSDK.OAuthBuilder()
//     .clientId("1000.BPPYY4E0MHWL1B0Y0B02Q6MG4QQKTD") // Replace with your client ID
//     .clientSecret("9e644de8b147ecb57ac1e1d8f1d2142fb956e68a6c") // Replace with your client secret
//     .refreshToken(
//       "1000.6b6a7a08987882ee320812d03b07aed6.6c47052b94a6335445ea43c96f2e3b4c"
//     ) // Replace with your refresh token
//     .build();

//     console.log("InitializeBuilder:", new ZOHOCRMSDK.InitializeBuilder());

//     const initializeBuilder = new ZOHOCRMSDK.InitializeBuilder(); 
//     const initializedBuilder = await initializeBuilder; 

//     await initializedBuilder
//         .environment(environment)
//         .token(token)
//         .initialize(); 

//   // await new ZOHOCRMSDK.InitializeBuilder()
//   //   .environment(environment)
//   //   .token(token)
//   //   .initialize();
// };

const createZohoCRMRecord = async (data) => {
  try {
    const moduleAPIName = "Buy_Lead"; // Replace with your custom module's API name
    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(
      moduleAPIName
    );

    const request = new ZOHOCRMSDK.Record.BodyWrapper();
    const recordsArray = [];
    const record = new ZOHOCRMSDK.Record.Record();

    // Map your data fields to Zoho CRM fields
    record.addKeyValue("Buy_Lead_Type", "Retail");
    record.addKeyValue("Name", data.screen_0_First_Name_0);
    record.addKeyValue("Buy_Leads_Last_Name", data.screen_0_Last_Name_1);
    record.addKeyValue("Primary_Phone_No", data.screen_0_Phone_Number_2);
    record.addKeyValue("Pin_Code", data.screen_0_Pincode_3);
    record.addKeyValue(
      "Registration_Number",
      data.screen_1_Registration_Number_0
    );
    record.addKeyValue("Kms_Driven", data.screen_1_Kms_Driven_1);
    record.addKeyValue("Owner_Serial", data.screen_1_Ownerships_2);
    record.addKeyValue("Preferred_Date", data.screen_1_Select_Date_3);

    recordsArray.push(record);
    request.setData(recordsArray);

    const headerInstance = new ZOHOCRMSDK.HeaderMap();
    const response = await recordOperations.createRecords(
      request,
      headerInstance
    );

    if (response) {
      const responseObject = response.getObject();
      if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
        responseObject.getData().forEach((actionResponse) => {
          if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {
            console.log(
              "Record created successfully:",
              actionResponse.getDetails()
            );
          } else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
            console.error(
              "Error creating record:",
              actionResponse.getMessage().getValue()
            );
          }
        });
      }
    }
  } catch (error) {
    console.error("Error while creating Zoho CRM record:", error);
  }
};

const getNextScreen = async (decryptedBody) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
  console.log("====================================");
  console.log(decryptedBody);
  console.log("====================================");
  // handle health check request
  if (action === "ping") {
    return {
      data: {
        status: "active",
      },
      screen: "SUCCESS", // Explicit screen to avoid missing field
    };
  }
  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      data: {
        acknowledged: true,
      },
      screen: "ERROR_SCREEN", // Adding screen for error
    };
  }

  // handle initial request when opening the flow
  if (action === "INIT") {
    return {
      routing_model: {
        QUESTION_ONE: ["screen_irbhvz"],
        screen_irbhvz: [],
      },
      data_api_version: "3.0",
      version: "6.0",
      data: {}, // Add this field
      screens: [
        {
          screen: "QUESTION_ONE",
          id: "QUESTION_ONE",
          title: "Sell your Bike Today!",
          data: {},
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "Form",
                name: "flow_path",
                children: [
                  {
                    type: "TextInput",
                    label: "First Name",
                    name: "First_Name_78060d",
                    required: true,
                    "input-type": "text",
                  },
                  {
                    type: "TextInput",
                    label: "Last Name",
                    name: "Last_Name_c71405",
                    required: true,
                    "input-type": "text",
                  },
                  {
                    type: "TextInput",
                    label: "Phone Number",
                    name: "Phone_Number_74f5cc",
                    required: true,
                    "input-type": "phone",
                  },
                  {
                    type: "TextInput",
                    label: "Pincode",
                    name: "Pincode_ad5cdd",
                    required: true,
                    "input-type": "number",
                  },
                  {
                    type: "Footer",
                    label: "Continue",
                    "on-click-action": {
                      name: "navigate",
                      next: {
                        type: "screen",
                        name: "screen_irbhvz",
                      },
                      payload: {
                        screen_0_First_Name_0: "${form.First_Name_78060d}",
                        screen_0_Last_Name_1: "${form.Last_Name_c71405}",
                        screen_0_Phone_Number_2: "${form.Phone_Number_74f5cc}",
                        screen_0_Pincode_3: "${form.Pincode_ad5cdd}",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          screen: "screen_irbhvz",
          id: "screen_irbhvz",
          title: "Submit",
          data: {
            screen_0_First_Name_0: {
              type: "string",
              __example__: "${data.screen_0_First_Name_0}",
            },
            screen_0_Last_Name_1: {
              type: "string",
              __example__: "${data.screen_0_Last_Name_1}",
            },
            screen_0_Phone_Number_2: {
              type: "string",
              __example__: "${data.screen_0_Phone_Number_2}",
            },
            screen_0_Pincode_3: {
              type: "string",
              __example__: "${data.screen_0_Pincode_3}",
            },
          },
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "Form",
                name: "flow_path",
                children: [
                  {
                    type: "TextInput",
                    name: "Registration_Number_949044",
                    label: "Registration Number",
                    required: true,
                    "input-type": "text",
                  },
                  {
                    type: "Dropdown",
                    label: "Kms Driven",
                    required: true,
                    name: "Kms_Driven_0a59bd",
                    "data-source": [
                      {
                        id: "0_5000",
                        title: "5000",
                      },
                      {
                        id: "1_10000",
                        title: "10000",
                      },
                      {
                        id: "2_15000",
                        title: "15000",
                      },
                      {
                        id: "3_20000",
                        title: "20000",
                      },
                      {
                        id: "4_25000",
                        title: "25000",
                      },
                      {
                        id: "5_30000",
                        title: "30000",
                      },
                      {
                        id: "6_35000",
                        title: "35000",
                      },
                    ],
                  },
                  {
                    type: "Dropdown",
                    label: "Ownerships",
                    required: true,
                    name: "Ownerships_fea0b0",
                    "data-source": [
                      {
                        id: "0_1st_Owner",
                        title: "1st Owner",
                      },
                      {
                        id: "1_2nd_Owner",
                        title: "2nd Owner",
                      },
                      {
                        id: "2_3rd_Owner",
                        title: "3rd Owner",
                      },
                    ],
                  },
                  {
                    type: "DatePicker",
                    label: "Select Date",
                    required: true,
                    name: "Select_Date_104aad",
                  },
                  {
                    type: "Footer",
                    label: "Submit",
                    "on-click-action": {
                      name: "data_exchange",
                      payload: {
                        screen_1_Registration_Number_0:
                          "${form.Registration_Number_949044}",
                        screen_1_Kms_Driven_1: "${form.Kms_Driven_0a59bd}",
                        screen_1_Ownerships_2: "${form.Ownerships_fea0b0}",
                        screen_1_Select_Date_3: "${form.Select_Date_104aad}",
                        screen_0_First_Name_0: "${data.screen_0_First_Name_0}",
                        screen_0_Last_Name_1: "${data.screen_0_Last_Name_1}",
                        screen_0_Phone_Number_2:
                          "${data.screen_0_Phone_Number_2}",
                        screen_0_Pincode_3: "${data.screen_0_Pincode_3}",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
      screen: "QUESTION_ONE", // Explicitly adding screen
    };
  }

  if (action === "data_exchange" && screen === "screen_irbhvz") {
    console.log("Received customer response:", data);
    // Extract and use submitted data
    const {
      screen_0_First_Name_0,
      screen_0_Last_Name_1,
      screen_0_Phone_Number_2,
      screen_0_Pincode_3,
      screen_1_Registration_Number_0,
      screen_1_Kms_Driven_1,
      screen_1_Ownerships_2,
      screen_1_Select_Date_3,
    } = data;

    // Validate data
    if (!screen_0_First_Name_0 || !screen_1_Registration_Number_0) {
      throw new Error("Required fields are missing.");
    }

    // Handle successful data submission
    return {
      screen: "SUCCESS",
      data: {
        message: "Customer data received successfully.",
        extension_message_response: {
          params: {
            flow_token: flow_token,
            customer_data: data,
            // optional_param2: "<value2>"
          },
        },
      },
    };

    // try {
    //   // Initialize and create the Zoho CRM record
    //   // await initializeZohoCRM(); 
    //   // await createZohoCRMRecord(data); 
  
    //   // // Call triggerFlowCompletion
    //   // await triggerFlowCompletion(data);
  
    //   // // Send Summary Message
    //   // await sendSummaryMessage(data);
  
    //   return {
    //     screen: "SUCCESS",
    //     data: {
    //       message: "Customer data received successfully.",
    //       extension_message_response: {
    //         params: {
    //           flow_token: flow_token,
    //           customer_data: data,
    //           // optional_param2: "<value2>"
    //         },
    //       },
    //     },
    //   };
    // } catch (error) {
    //   console.error("Error creating Zoho CRM record:", error);
    //   // Handle the error gracefully 
    //   // For example, return an error response:
    //   return {
    //     screen: "ERROR", 
    //     data: { 
    //       message: "Failed to create Zoho CRM record." 
    //     }
    //   };
    // }

    // Initialize and create the Zoho CRM record
    // await initializeZohoCRM();
    // await createZohoCRMRecord(data);

    // // Call triggerFlowCompletion
    // await triggerFlowCompletion(data);

    // // Send Summary Message
    // await sendSummaryMessage(data);

    // Handle successful data submission
    // return {
    //   screen: "SUCCESS",
    //   data: {
    //     message: "Customer data received successfully.",
    //     extension_message_response: {
    //       params: {
    //         flow_token: flow_token,
    //         customer_data: data,
    //         // optional_param2: "<value2>"
    //       },
    //     },
    //   },
    // };

  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};

// Function to trigger flow completion
const triggerFlowCompletion = async (data) => {
  console.log("Flow completion triggered with data:", data);
  // You can add further steps for logging, processing, or triggering other actions
};

// Function to send a summary message to the user
const sendSummaryMessage = async (data) => {
  const summary = `
      Thank you for submitting your details!
      Name: ${data.screen_0_First_Name_0} ${data.screen_0_Last_Name_1}
      Phone: ${data.screen_0_Phone_Number_2}
      Pincode: ${data.screen_0_Pincode_3}
      Registration Number: ${data.screen_1_Registration_Number_0}
      Kms Driven: ${data.screen_1_Kms_Driven_1}
      Ownership: ${data.screen_1_Ownerships_2}
      Date: ${data.screen_1_Select_Date_3}
    `;
  console.log("Sending summary message:", summary);
  // Here, implement the logic to send the summary message (e.g., via email, SMS, or other communication channels)
};

export default getNextScreen; 