const axios = require('axios').default;

import { messageLog } from '../services/index.service';

export async function vismaGlobalUpdateToXp(tenant: any, customers: any, products: any) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from('su' + ":" + 'tpwcom62020').toString("base64")
  }

  const url = tenant.url + '/visma-global-update';
  messageLog(tenant.user, `  POST ${url}`);

  return await axios.post(url, {products, customers, tenant: {clientId: tenant.clientId, accessToken: tenant.accessToken, api: tenant.api}}, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
}

export async function vismaGlobalDiscountUpdateToXp(tenant: any, discounts: any) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from('su' + ":" + 'tpwcom62020').toString("base64")
  }

  const url = tenant.url + '/visma-global-discount-update';
  messageLog(tenant.user, `  POST ${url}`);

  return await axios.post(url, {discounts, tenant: {clientId: tenant.clientId, accessToken: tenant.accessToken, api: tenant.api}}, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
}
