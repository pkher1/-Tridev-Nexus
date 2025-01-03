/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const getNextScreen = async (decryptedBody) => {
    const { screen, data, version, action, flow_token } = decryptedBody;

    console.log('====================================');
    console.log(decryptedBody);
    console.log('====================================');
    
    // handle health check request
    if (action === "ping") {
      return {
        data: {
          status: "active",
        },
      };
    }
  
    // handle error notification
    if (data?.error) {
      console.warn("Received client error:", data);
      return {
        data: {
          acknowledged: true,
        },
      };
    }
  
    // handle initial request when opening the flow
    // if (action === "INIT") {
    //   return {
    //     "routing_model": {
    //       "QUESTION_ONE": ["screen_irbhvz"],
    //       "screen_irbhvz": []
    //     },
    //     "data_api_version": "3.0",
    //     "version": "6.0",
    //     "screens": [
    //       {
    //         "screen": "QUESTION_ONE",  // Ensure the 'screen' key is here
    //         "id": "QUESTION_ONE",
    //         "title": "Sell your Bike Today!",
    //         "data": {},
    //         "layout": {
    //           "type": "SingleColumnLayout",
    //           "children": [
    //             {
    //               "type": "Form",
    //               "name": "flow_path",
    //               "children": [
    //                 {
    //                   "type": "TextInput",
    //                   "label": "First Name",
    //                   "name": "First_Name_78060d",
    //                   "required": true,
    //                   "input-type": "text"
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       },
    //       {
    //         "screen": "screen_irbhvz",  // Ensure the 'screen' key is here as well
    //         "id": "screen_irbhvz",
    //         "title": "Submit",
    //         "data": {},
    //         "terminal": true,
    //         "layout": {
    //           "type": "SingleColumnLayout",
    //           "children": [
    //             {
    //               "type": "Text",
    //               "text": "Thank you for submitting!"
    //             }
    //           ]
    //         }
    //       }
    //     ]
    //   }
    //   ;
    // }

    // if (action === "INIT") {
    //     return {
    //       screen: "RECOMMEND",
    //       id: "RECOMMEND",
    //       title: "Feedback 1 of 2",
    //       data: {},
    //       layout: {
    //         "type": "SingleColumnLayout",
    //         "children": [
    //           {
    //             "type": "Form",
    //             "name": "form",
    //             "children": [
    //               {
    //                 "type": "TextSubheading",
    //                 "text": "Would you recommend us to a friend?"
    //               },
    //               {
    //                 "type": "RadioButtonsGroup",
    //                 "label": "Choose one",
    //                 "name": "Choose_one",
    //                 "data-source": [
    //                   {
    //                     "id": "0_Yes",
    //                     "title": "Yes"
    //                   },
    //                   {
    //                     "id": "1_No",
    //                     "title": "No"
    //                   }
    //                 ],
    //                 "required": true
    //               },
    //               {
    //                 "type": "TextSubheading",
    //                 "text": "How could we do better?"
    //               },
    //               {
    //                 "type": "TextArea",
    //                 "label": "Leave a comment",
    //                 "required": false,
    //                 "name": "Leave_a_comment"
    //               },
    //               {
    //                 "type": "Footer",
    //                 "label": "Continue",
    //                 "on-click-action": {
    //                   "name": "navigate",
    //                   "next": {
    //                     "type": "screen",
    //                     "name": "RATE"
    //                   },
    //                   "payload": {
    //                     "screen_0_Choose_one_0": "${form.Choose_one}",
    //                     "screen_0_Leave_a_comment_1": "${form.Leave_a_comment}"
    //                   }
    //                 }
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     };
    //   }

    if (action === "INIT") {
        return {
          data_api_version: "3.0",
          version: "6.0",
          screen: "QUESTION_ONE",
          id: "QUESTION_ONE",
          title: "Sell your Bike Today!",
          data: {},
          layout: {
            "type": "SingleColumnLayout",
            "children": [
              {
                "type": "Form",
                "name": "flow_path",
                "children": [
                  {
                    "type": "TextInput",
                    "label": "First Name",
                    "name": "First_Name_78060d",
                    "required": true,
                    "input-type": "text"
                  },
                  {
                    "type": "TextInput",
                    "label": "Last Name",
                    "name": "Last_Name_c71405",
                    "required": true,
                    "input-type": "text"
                  },
                  {
                    "type": "TextInput",
                    "label": "Phone Number",
                    "name": "Phone_Number_74f5cc",
                    "required": true,
                    "input-type": "phone"
                  },
                  {
                    "type": "TextInput",
                    "label": "Pincode",
                    "name": "Pincode_ad5cdd",
                    "required": true,
                    "input-type": "number"
                  },
                  {
                    "type": "Footer",
                    "label": "Continue",
                    "on-click-action": {
                      "name": "navigate",
                      "next": {
                        "type": "screen",
                        "name": "screen_irbhvz"
                      },
                      "payload": {
                        "screen_0_First_Name_0": "${form.First_Name_78060d}",
                        "screen_0_Last_Name_1": "${form.Last_Name_c71405}",
                        "screen_0_Phone_Number_2": "${form.Phone_Number_74f5cc}",
                        "screen_0_Pincode_3": "${form.Pincode_ad5cdd}"
                      }
                    }
                  }
                ]
              }
            ]
          }
        };
      }
  
    if (action === "data_exchange") {
      // handle the request based on the current screen
      switch (screen) {
        case "MY_SCREEN":
          // TODO: process flow input data
          console.info("Input name:", data?.name);
  
          // send success response to complete and close the flow
          return {
            screen: "SUCCESS",
            data: {
              extension_message_response: {
                params: {
                  flow_token,
                },
              },
            },
          };
        default:
          break;
      }
    }
  
    console.error("Unhandled request body:", decryptedBody);
    throw new Error(
      "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
    );
  };

  module.exports = { getNextScreen };