import { Connection, createConnections, getConnection } from "typeorm";
import * as config from "config";
import moment from "moment"

import { TenantService, TokenService, messageLog } from "../services/index.service";
// import { INTEGRATIONS } from "../models/common.model";
// import { loadInitialCustomerData } from "../app/customer/customer";
import { loadInitialProductData } from "../app/product/product";

async function initialImportProductAndCustomerData() {
  if (!process.env.npm_config_user) {
    console.log("No tenant user found. Run 'npm run initialDataImport -user=<user_name>'");
    return;
  }

  if (true) {
    console.log("Tenant user: " + process.env.npm_config_user);
    return;
  }
  console.log("Tenant user: " + process.env.npm_config_user);
  const tenantService = new TenantService();
  const tenant = tenantService.getTenantByUser(process.env.npm_config_user as string);

  try {
    if (tenant) {
      const tokenService = new TokenService();
      const tokenInfo = await tokenService.getTokenFromDB(tenant.user);  // tokenInfo = { access_token: '..', companyId:'...'}
      
      if (tokenInfo) {
        messageLog(tenant.user, "Start of initial data import");
        await loadInitialProductData(tenant, tokenInfo);
        // await loadInitialCustomerData(tenant, tokenInfo);
        messageLog(tenant.user, "End of initial data import \n");
      } else {
        messageLog(tenant.user, "Token is not generated. Please generate the token from storeshop.");
      }
    
    } else {
      messageLog("", "No tenant user found");
    }
  } catch (e: any) {
    messageLog("", "Initial data import: " + e.message);
  }
}

createConnections().then((connections: Connection[]) => {
  // This scheduler will run for one time to load all data for initial time
  messageLog("", "Database connection success");
  initialImportProductAndCustomerData();
}).catch((error) => {
  messageLog("", "Failed to start server. " + error.message);
  console.log(error)
});
