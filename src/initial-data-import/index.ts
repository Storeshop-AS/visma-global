import { Connection, createConnections, getConnection } from 'typeorm';
import * as config from 'config';
import moment from 'moment';

const axios = require('axios').default;

import { TenantService, messageLog } from '../services/index.service';
import { loadCustomerData } from '../app/customer/customer';
import { loadProductData } from '../app/product/product';

async function vismaGlobalUpdateToXp(tenant: any, customers: any, products: any) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from(tenant.user + ":" + tenant.password).toString("base64"),
  }
  const url = tenant.url + '/visma-global-update';
  messageLog(tenant.user, `  POST ${url}`);
  return await axios.post(url, {products, customers}, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
}

async function loadInitialProductData() {
  if (!process.env.npm_config_user) {
    console.log(`No tenant user found. Run "npm run initialDataImport -user=<user_name>"`);
    return;
  }

  const tenantService = new TenantService();
  const tenant = tenantService.getTenantByUser(process.env.npm_config_user as string);
  const fromDate = moment().subtract(3, 'years');

  if (!tenant) {
    messageLog(process.env.npm_config_user, 'Tenant not found in config');
    return;
  }

  try {
    messageLog(tenant.user, `-- Start of initial data import`);
    await loadProductData(tenant, fromDate);

    const customers = await loadCustomerData(tenant, fromDate);
    const products = await loadProductData(tenant, fromDate);

    const xpResponse = await vismaGlobalUpdateToXp(tenant, customers, products);
    console.log(xpResponse?.data || 'No response found!');
  }
  catch (e: any) {
    messageLog(process.env.npm_config_user, 'ERROR initial data import: ' + e.message);
  }

  messageLog(tenant.user, `-- End initial data import`);
}

loadInitialProductData();
