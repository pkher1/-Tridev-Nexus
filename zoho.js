import axios from "axios";
import NodeCache from "node-cache";
import axiosRetry from "axios-retry";
import { format, parse } from "date-fns";

const cache = new NodeCache({ stdTTL: 3600 }); // Token cached for 1 hour

const ZOHO_ACCESS_TOKEN = "1000.d2a700c9eb53e7f40b978d15ee71d4e3.baf0f76b022cfcbd0fb6bb2895f0b09b"; // Optional, not used initially
const ZOHO_BASE_API_URL = "https://www.zohoapis.com";
const ZOHO_BASE_AUTH_URL = "https://accounts.zoho.com";
const ZOHO_CLIENT_ID = "1000.G6VFOBZA2XLTYFS85D5LL64EKQ23JJ";
const ZOHO_CLIENT_SECRET = "2b31b164b8085c1d157188a45a52772cdb5cee16bd";
const ZOHO_GRANT_TOKEN = "1000.84fd4711f371367523aa1a626b2f75fa.b5c352dcdb4c96c7d42f7add1060bd09";
const ZOHO_REFRESH_TOKEN = "1000.5de9f1f1d7b3c3379e5abf9fb0fa6bcb.cd9ed095bdad96cf2cef3f10a87dd9c6";
const ZOHO_MODULE = "Buy_Lead";

// Configure axios retry
axiosRetry(axios, { retries: 3, retryCondition: axiosRetry.isRetryableError });

class ZohoAPIClient {
  constructor() {
    this.baseAuthUrl = ZOHO_BASE_AUTH_URL;
    this.apiUrl = ZOHO_BASE_API_URL;
    this.clientId = ZOHO_CLIENT_ID;
    this.clientSecret = ZOHO_CLIENT_SECRET;
    this.refreshToken = ZOHO_REFRESH_TOKEN;
    this.grantToken = ZOHO_GRANT_TOKEN;
    this.zohoModule = ZOHO_MODULE;
    this.accessToken = ZOHO_ACCESS_TOKEN;
  }

  async _generateToken() {
    if (!this.grantToken) {
      throw new Error("Grant Token is not set");
    }
    const data = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: "your_redirect_uri",
      code: this.grantToken,
    });

    try {
      const response = await axios.post(
        `${this.baseAuthUrl}/oauth/v2/token`,
        data.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000,
        }
      );
      console.log("Token Response:", response.data);
      return response.data;
    } catch (error) {
      let errorMessage = "Error generating token";
      if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async _refreshAccessToken() {
    const params = {
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "refresh_token",
    };

    try {
      const response = await axios.post(
        `${this.baseAuthUrl}/oauth/v2/token`,
        null,
        { params, timeout: 60000 }
      );
      console.log("Token Refresh Response:", response.data);
      cache.set("zoho_token", response.data, response.data.expires_in);
    } catch (error) {
      let errorMessage = "Error refreshing access token";
      if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async _getAccessToken() {
    let tokens = cache.get("zoho_token");
    if (!tokens) {
      await this._refreshAccessToken();
      tokens = cache.get("zoho_token");
    }
    return tokens.access_token;
  }

  async _sendZohoRequest(url, payload, accessToken, method = "POST") {
    try {
      const response = await axios({
        url,
        method,
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(payload),
        timeout: 60000,
      });

      if (![200, 201].includes(response.status)) {
        console.error("Zoho Response Error:", JSON.stringify(response.data, null, 2));
        throw new Error(`Zoho API Error: ${JSON.stringify(response.data, null, 2)}`);
      }

      return response.data;
    } catch (error) {
      // Extract the error details from the Zoho API response
      let errorMessage = "Unknown error occurred";
      if (error.response?.data) {
        const zohoError = error.response.data;
        if (zohoError.code) {
          errorMessage = `Zoho API Error ${zohoError.code}: ${zohoError.message || zohoError.details?.message || JSON.stringify(zohoError)}`;
        } else {
          errorMessage = `Zoho API Error: ${JSON.stringify(zohoError, null, 2)}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Error sending request:", {
        message: errorMessage,
        url,
        method,
        status: error.response?.status,
        data: error.response?.data
      });

      throw new Error(errorMessage);
    }
  }

  async getLeadDetails(leadId) {
    const accessToken = await this._getAccessToken();
    const url = `${this.apiUrl}/crm/v2/${this.zohoModule}/${leadId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      });

      console.log("Lead Details Response Status:", response.status);

      if (response.status !== 200) {
        console.error("Failed to fetch lead details:", response.data);
        throw new Error("Failed to fetch lead details");
      }

      return response.data.data[0];
    } catch (error) {
      let errorMessage = "Error fetching lead details";
      if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateZohoLeadStatus(leadId, status = null, record = null) {
    try {
      const url = `${this.apiUrl}/crm/v2/${this.zohoModule}/${leadId}`;
      const accessToken = await this._getAccessToken();

      if (!record) {
        record = {
          id: leadId,
          Status: status,
        };
      }

      const payload = { data: [record] };
      const responseData = await this._sendZohoRequest(url, payload, accessToken, "PUT");

      console.log("Zoho Buy Lead Response:", responseData);
      return responseData.data[0].details.id;
    } catch (error) {
      let errorMessage = "Error updating lead status";
      if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async createLead(flowData) {
    try {
      // Validate required fields
      const requiredFields = [
        'screen_0_First_Name_0',
        // 'screen_0_Last_Name_1',
        'screen_1_Time_Slot_4',
        'screen_0_Phone_Number_2',
        'screen_0_Pincode_3',
        'screen_0_Registration_Number_3',
        'screen_1_Kms_Driven_1',
        'screen_1_MFY_0',
        'screen_0_Brand_4',
        'screen_1_Select_Date_3'
      ];

      const missingFields = requiredFields.filter(field => !flowData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const url = `${this.apiUrl}/crm/v2/${this.zohoModule}`;
      const accessToken = await this._getAccessToken();

      // Extract values from IDs safely
      const extractValue = (field, type) => {
        try {
          if (type === 'kms') {
            // Extract the full range like "5_25,000_-_30,000_KMs" -> "25,000 - 30,000 KMs"
            const match = field.match(/\d+_(.+)/);
            return match ? match[1] : field;
          } else if (type === 'brand') {
            // Extract brand title after underscore like "2_Hero" -> "Hero"
            const match = field.match(/\d+_(.+)/);
            return match ? match[1] : field;
          } else if (type === 'year') {
            // Extract year like "8_2017" -> "2017"
            const match = field.match(/\d+_(\d+)/);
            return match ? match[1] : field;
          }
          return field;
        } catch (e) {
          console.warn(`Failed to extract value from ${field}:`, e);
          return field;
        }
      };

      // Transform whatsapp flow data to Zoho CRM format with validation
      const zohoLeadData = {
        Name: String(flowData.screen_0_First_Name_0).trim(),
        // Last_Name: String(flowData.screen_0_Last_Name_1).trim(),
        Primary_Phone_No: String(flowData.screen_0_Phone_Number_2).trim(),
        Pin_Code: String(flowData.screen_0_Pincode_3).trim(),
        Registration_Number: String(flowData.screen_0_Registration_Number_3).trim(),
        Year_of_Manufacture: extractValue(flowData.screen_1_MFY_0, 'year'),
        // Preferred_Time::extractValue(flowData.screen_1_Time_Slot_4, /\d+_(\d+)/),
        Kms_Driven: extractValue(flowData.screen_1_Kms_Driven_1, 'kms'),
        Brand: extractValue(flowData.screen_0_Brand_4, 'brand'),
        Preferred_Date: (() => {
          // Parse the date from yyyy-MM-dd format and set time to 15:00 (afternoon)
          const date = parse(flowData.screen_1_Select_Date_3, 'yyyy-MM-dd', new Date());
          date.setHours(15, 0, 0);
          // Format to ISO8601 with India timezone offset (+05:30)
          return format(date, "yyyy-MM-dd'T'HH:mm:ss'+05:30'");
        })(),
        Source: "WhatsApp",
        Status: "Untouched",
        Buy_Lead_Type: "Retail"
      };

      // Log the transformed data for debugging
      console.log("Transformed Zoho Lead Data:", JSON.stringify(zohoLeadData, null, 2));

      const payload = { data: [zohoLeadData] };
      const responseData = await this._sendZohoRequest(url, payload, accessToken);

      console.log("Zoho Lead Creation Response:", JSON.stringify(responseData, null, 2));
      return responseData.data[0].details.id;
    } catch (error) {
      let errorMessage = "Error creating lead";
      if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error(errorMessage, {
        originalData: flowData,
        status: error.response?.status,
        responseData: error.response?.data
      });
      throw new Error(errorMessage);
    }
  }
}

export default ZohoAPIClient;


// const ZohoAPIClient = require("./ZohoAPIClient");

// (async () => {
//   const zohoClient = new ZohoAPIClient();

//   try {
//     const leadDetails = await zohoClient.getLeadDetails("lead_id_here");
//     console.log("Lead Details:", leadDetails);

//     const updatedLead = await zohoClient.updateZohoLeadStatus("lead_id_here", "Updated Status");
//     console.log("Updated Lead ID:", updatedLead);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();
