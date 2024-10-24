import express, { Request, Response } from "express";
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
  setInterval(importProductAndCustomerDaemon, SYNC_INTERVAL);

  async function vismaGlobalUpdateToXp(tenant: any, customers: any, products: any) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from('su' + ":" + 'tpwcom62020').toString("base64"),
    }
    const url = tenant.url + '/visma-global-update';
    messageLog(tenant.user, `  POST ${url}`);
    return await axios.post(url, {products, customers, tenant: {clientId: tenant.clientId, accessToken: tenant.accessToken, api: tenant.api}}, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
  }

  async function importProductAndCustomerDaemon() {
    console.log('--- importProductAndCustomerDaemon() called ---');
    let products;
    const tenantService = new TenantService();
    const tenants = tenantService.getTenantsByIntegration(INTEGRATIONS.vismaGlobal);
    console.log(`tenants: ${JSON.stringify(tenants, null, ' ')}`);
  
    for (const tenant of tenants) {
      const fromDate = moment().subtract(7, 'days');
  
      try {
        messageLog(tenant.user, `-- Start of data sync from ${fromDate.format('DD.MM.YYYY')}`);

        products = await loadProductData(tenant, fromDate);
        messageLog(tenant.user, `Received ${products && products.length} products`);

        const customers = await loadCustomerData(tenant, fromDate);
        messageLog(tenant.user, `Received ${customers && customers.length} customers`);

        const xpResponse = await vismaGlobalUpdateToXp(tenant, customers && customers.slice(0, 1000) || [], products && products.slice(0, 1000) || []);
        // const xpResponse = await vismaGlobalUpdateToXp(tenant, [], products && products.slice(0, 1000) || []);
        console.log(xpResponse?.data || 'No response found!');
      }
      catch (e: any) {
        messageLog(tenant.user, 'ERROR data sync: ' + e);
      }
    }
  }
})
