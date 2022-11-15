import express, { Request, Response } from "express";
import { Connection, createConnections, getConnection } from "typeorm";
import * as config from "config";
import moment from "moment"

import { TenantService, TokenService, messageLog } from "./services/index.service";
import { INTEGRATIONS } from "./models/common.model";
import { customerEtlProcess } from "./app/customer/customer";
import { productEtlProcess } from "./app/product/product";

const port: number = 8600;
const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log("Server Started at Port, " + port)
})

createConnections().then((connections: Connection[]) => {
  console.log('DB connection success');

  // This scheduler will run in every 15 min for extract data from visma global and load to XP
  const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
  // importProductAndCustomerDaemon();
  // setInterval(importProductAndCustomerDaemon, SYNC_INTERVAL)

  async function importProductAndCustomerDaemon() {
    const tenantService = new TenantService();
    const tenants = tenantService.getTenantsByIntegration(INTEGRATIONS.vismaGlobal);
    for (const tenant of tenants) {
      try {
        if (tenant) {
          const tokenService = new TokenService();
          const tokenInfo = await tokenService.getTokenFromDB(tenant.user);  // tokenInfo = { access_token: '..', companyId:'...'}

          if (tokenInfo) {
            messageLog(tenant.user, "Start of sequence message");
            await productEtlProcess(tenant, tokenInfo);
            // await customerEtlProcess(tenant, tokenInfo);
            messageLog(tenant.user, "End of sequence message \n");
          } else {            
            messageLog(tenant.user, "Token is not generated. Please set the token in database.");
          }

        } else {
          messageLog("", "No tenant set");      
        }
      } catch (e: any) {
        messageLog("", "daemon " + e.message);
      }
    }
  }

}).catch((error: any) => {
  messageLog("", "Failed to start server. " + error.message);
  console.log(error)
});
