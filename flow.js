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
                    type: "TextSubheading",
                    text: "Please enter your name",
                  },
                  {
                    type: "TextInput",
                    label: "Name",
                    name: "First_Name_78060d",
                    required: true,
                    "input-type": "text",
                  },
                  {
                    type: "TextSubheading",
                    text: "Enter your pincode",
                  },
                  {
                    type: "TextInput",
                    label: "Pincode",
                    name: "Pincode_ad5cdd",
                    required: true,
                    "input-type": "number",
                    "max-chars": 6,
                    "min-chars": 6,
                  },
                  {
                    type: "TextSubheading",
                    text: "Enter your registration no",
                  },
                  {
                    type: "TextInput",
                    name: "Registration_Number_949044",
                    label: "Reg No.",
                    required: true,
                    "input-type": "text",
                  },
                  {
                    type: "TextSubheading",
                    text: "Brand of your two wheeler",
                  },
                  {
                    type: "Dropdown",
                    label: "Brand",
                    name: "Brand",
                    required: true,
                    "data-source": [
                      {
                        id: "0_TVS",
                        title: "TVS",
                      },
                      {
                        id: "1_Bajaj",
                        title: "Bajaj",
                      },
                      {
                        id: "2_Hero",
                        title: "Hero",
                      },
                      {
                        id: "3_Honda",
                        title: "Honda",
                      },
                      {
                        id: "4_Yamaha",
                        title: "Yamaha",
                      },
                      {
                        id: "5_Royal_Enfield",
                        title: "Royal Enfield",
                      },
                      {
                        id: "6_Suzuki",
                        title: "Suzuki",
                      },
                      {
                        id: "7_Jawa",
                        title: "Jawa",
                      },
                      {
                        id: "8_KTM",
                        title: "KTM",
                      },
                      {
                        id: "9_Kawasaki",
                        title: "Kawasaki",
                      },
                      {
                        id: "10_Ola",
                        title: "Ola",
                      },
                      {
                        id: "11_Vespa",
                        title: "Vespa",
                      },
                      {
                        id: "12_Triumph",
                        title: "Triumph",
                      },
                      {
                        id: "13_Yezdi",
                        title: "Yezdi",
                      },
                      {
                        id: "14_Ather",
                        title: "Ather",
                      },
                      {
                        id: "15_Hero_Electric",
                        title: "Hero Electric",
                      },
                      {
                        id: "16_Pure_EV",
                        title: "Pure EV",
                      },
                      {
                        id: "17_BMW",
                        title: "BMW",
                      },
                      {
                        id: "18_Ducati",
                        title: "Ducati",
                      },
                      {
                        id: "19_Harley-Davidson",
                        title: "Harley-Davidson",
                      },
                      {
                        id: "20_Benelli",
                        title: "Benelli",
                      },
                      {
                        id: "21_Husqvarna",
                        title: "Husqvarna",
                      },
                      {
                        id: "22_Ampere",
                        title: "Ampere",
                      },
                      {
                        id: "23_Aprilia",
                        title: "Aprilia",
                      },
                      {
                        id: "24_Mahindra",
                        title: "Mahindra",
                      },
                    ],
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
                        screen_0_Registration_Number_3:
                          "${form.Registration_Number_949044}",
                        screen_0_Brand_4: "${form.Brand}",
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
          id: "screen_irbhvz",
          title: "Submit",
          data: {
            screen_0_First_Name_0: {
              type: "string",
              __example__: "Example",
            },
            screen_0_Registration_Number_3: {
              type: "string",
              __example__: "Example",
            },
            screen_0_Brand_4: {
              type: "string",
              __example__: "Example",
            },
            screen_0_Pincode_3: {
              type: "string",
              __example__: "Example",
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
                    type: "TextSubheading",
                    text: "Enter the year of your two-wheeler",
                  },
                  {
                    type: "Dropdown",
                    label: "MFG Year",
                    required: true,
                    name: "MFY",
                    "data-source": [
                      { id: "0_2025", title: "2025" },
                      { id: "1_2024", title: "2024" },
                      { id: "2_2023", title: "2023" },
                      { id: "3_2022", title: "2022" },
                      { id: "4_2021", title: "2021" },
                      { id: "5_2020", title: "2020" },
                      { id: "6_2019", title: "2019" },
                      { id: "7_2018", title: "2018" },
                      { id: "8_2017", title: "2017" },
                      { id: "9_2016", title: "2016" },
                      { id: "10_2015", title: "2015" },
                      { id: "11_<_2015", title: "< 2015" },
                    ],
                  },
                  {
                    type: "TextSubheading",
                    text: "Select the KMs Driven",
                  },
                  {
                    type: "Dropdown",
                    label: "Kms Driven",
                    required: true,
                    name: "Kms_Driven_0a59bd",
                    "data-source": [
                      {
                        id: "0_0_-_5,000_KMs",
                        title: "0 - 5,000 KMs",
                      },
                      {
                        id: "1_5,000_-_10,000_KMs",
                        title: "5,000 - 10,000 KMs",
                      },
                      {
                        id: "2_10,000_-_15,000_KMs",
                        title: "10,000 - 15,000 KMs",
                      },
                      {
                        id: "3_15,000_-_20,000_KMs",
                        title: "15,000 - 20,000 KMs",
                      },
                      {
                        id: "4_20,000_-_25,000_KMs",
                        title: "20,000 - 25,000 KMs",
                      },
                      {
                        id: "5_25,000_-_30,000_KMs",
                        title: "25,000 - 30,000 KMs",
                      },
                      {
                        id: "6_30,000_-_35,000_KMs",
                        title: "30,000 - 35,000 KMs",
                      },
                      {
                        id: "7_35,000_-_40,000_KMs",
                        title: "35,000 - 40,000 KMs",
                      },
                      {
                        id: "8_40,000_-_45,000_KMs",
                        title: "40,000 - 45,000 KMs",
                      },
                      {
                        id: "9_45,000_-_50,000_KMs",
                        title: "45,000 - 50,000 KMs",
                      },
                      {
                        id: "10_50,000_-_55,000_KMs",
                        title: "50,000 - 55,000 KMs",
                      },
                      {
                        id: "11_55,000_-_60,000_KMs",
                        title: "55,000 - 60,000 KMs",
                      },
                      {
                        id: "12_60,000_-_65,000_KMs",
                        title: "60,000 - 65,000 KMs",
                      },
                      {
                        id: "13_65,000_-_70,000_KMs",
                        title: "65,000 - 70,000 KMs",
                      },
                      {
                        id: "14_70,000+_KMs",
                        title: "70,000+ KMs",
                      },
                    ],
                  },
                  {
                    type: "TextSubheading",
                    text: "Select your preffered date for home inspection",
                  },
                  {
                    type: "DatePicker",
                    label: "Select Date",
                    required: true,
                    name: "Select_Date_104aad",
                    "max-date": "2025-05-31",
                    "min-date": "2025-02-13",
                  },
                  {
                    text: "Choose a time slot",
                    type: "TextSubheading",
                  },
                  {
                    "data-source": [
                      {
                        id: "0_Morning",
                        title: "Morning",
                      },
                      {
                        id: "1_Afternoon",
                        title: "Afternoon",
                      },
                      {
                        id: "2_Evening",
                        title: "Evening",
                      },
                    ],
                    label: "Choose a time slot",
                    name: "Choose_a_time_slot_85a2d3",
                    required: true,
                    type: "Dropdown",
                  },
                  {
                    type: "Footer",
                    label: "Submit",
                    "on-click-action": {
                      name: "data_exchange",
                      payload: {
                        screen_1_MFY_0: "${form.MFY}",
                        screen_1_Kms_Driven_1: "${form.Kms_Driven_0a59bd}",
                        screen_1_Time_Slot_4:
                          "${form.Choose_a_time_slot_85a2d3}",
                        screen_1_Select_Date_3: "${form.Select_Date_104aad}",
                        screen_0_First_Name_0: "${data.screen_0_First_Name_0}",
                        screen_0_Registration_Number_3:
                          "${data.screen_0_Registration_Number_3}",
                        screen_0_Brand_4: "${data.screen_0_Brand_4}",
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
      screen_0_Brand_4,
      screen_0_Phone_Number_2,
      screen_0_Pincode_3,
      screen_0_Registration_Number_3,
      screen_1_Kms_Driven_1,
      // screen_1_Ownerships_2,
      screen_1_Select_Date_3,
    } = data;

    // Validate data
    if (!screen_0_First_Name_0 || !screen_0_Registration_Number_3) {
      throw new Error("Required fields are missing.");
    }

    try {
      // Handle successful data submission
      const summary = `
      Thank you for submitting your details!
      Name: ${data.screen_0_First_Name_0} ${data.screen_0_Brand_4}
      Phone: ${data.screen_0_Phone_Number_2}
      Pincode: ${data.screen_0_Pincode_3}
      Registration Number: ${data.screen_0_Registration_Number_3}
      Kms Driven: ${data.screen_1_Kms_Driven_1}
      Ownership: ${data.screen_1_Kms_Driven_1}
      Date: ${data.screen_1_Select_Date_3}
    `;

      return {
        screen: "SUCCESS",
        data: {
          message: summary,
          extension_message_response: {
            params: {
              flow_token: flow_token,
              customer_data: data,
            },
          },
        },
      };
    } catch (error) {
      console.error("Error creating lead in Zoho CRM:", error);

      // Return an error message to the user
      return {
        screen: "ERROR",
        data: {
          message:
            "We apologize, but there was an issue processing your request. Please try again later or contact support.",
          error_details: error.message,
          extension_message_response: {
            params: {
              flow_token: flow_token,
              error: error.message,
            },
          },
        },
      };
    }

    //   // // Call triggerFlowCompletion
    //   // await triggerFlowCompletion(data);

    //   // // Send Summary Message
    //   // await sendSummaryMessage(data);
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
      Name: ${data.screen_0_First_Name_0} ${data.screen_0_Brand_4}
      Phone: ${data.screen_0_Phone_Number_2}
      Pincode: ${data.screen_0_Pincode_3}
      Registration Number: ${data.screen_0_Registration_Number_3}
      Kms Driven: ${data.screen_1_Kms_Driven_1}
      Ownership: ${data.screen_1_Kms_Driven_1}
      Date: ${data.screen_1_Select_Date_3}
    `;
  console.log("Sending summary message:", summary);
  // Here, implement the logic to send the summary message (e.g., via email, SMS, or other communication channels)
};

export default getNextScreen;
