import express, { Request, Response } from "express";
import { Connection, createConnections, getConnection } from "typeorm";
import * as config from "config";
import moment from "moment";

const axios = require('axios').default;

import { TenantService, TokenService, messageLog } from "./services/index.service";
import { INTEGRATIONS } from "./models/common.model";
import { loadCustomerData } from "./app/customer/customer";
import { loadProductData } from './app/product/product';

const port: number = 8600;
const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log("Server Started at Port, " + port);

  // This scheduler will run in every 1 hour min for extract data from visma global and load to XP
  const SYNC_INTERVAL = 60 * 60 * 1000; // 60 minutes

  importProductAndCustomerDaemon();
  // setInterval(importProductAndCustomerDaemon, SYNC_INTERVAL);

  async function vismaGlobalUpdateToXp(tenant: any, customers: any, products: any) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(tenant.user + ":" + tenant.password).toString("base64"),
    }
    const url = tenant.url + '/visma-global-update';
    messageLog(tenant.user, `  POST ${url}`);
    return await axios.post(url, {products, customers}, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
  }

  async function importProductAndCustomerDaemon() {
    const tenantService = new TenantService();
    const tenants = tenantService.getTenantsByIntegration(INTEGRATIONS.vismaGlobal);
  
    for (const tenant of tenants) {
      const fromDate = moment().subtract(7, 'days');
  
      try {
        messageLog(tenant.user, `-- Start of data sync from ${fromDate.format('DD.MM.YYYY')}`);
        const customers = await loadCustomerData(tenant, fromDate);
        const products = await loadProductData(tenant, fromDate);

        const xpResponse = await vismaGlobalUpdateToXp(tenant, customers.slice(0, 10), products.slice(0, 10));
        console.log(xpResponse?.data || 'No response found!');
      }
      catch (e: any) {
        messageLog(tenant.user, 'ERROR data sync: ' + e);
      }
    }
  }
})
