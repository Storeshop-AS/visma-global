import * as fs from 'fs';
import moment from 'moment';

import { TenantService, messageLog } from '../services/index.service';
import { vismaGlobalDiscountUpdateToXp } from '../services/xp.service';
import { loadDiscountData, loadPriceList } from '../app/discount/discount';

import { customers } from './customers';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCustomer(tenant: any, fromDate: any, i = 0) {
  const customerId = customers[i] || false;
  // const customerId = '12262';
  if (customerId) {
    const discounts = await loadDiscountData(tenant, customerId, fromDate);
    if (discounts && discounts.length > 0) {
      console.log(`customerId: `, JSON.stringify(customerId, null, ' '));
      const xpResponse = await vismaGlobalDiscountUpdateToXp(tenant, discounts);
      console.log(xpResponse?.data || 'No response found!');
      if (xpResponse?.data) {
        await handleCustomer(tenant, fromDate, i+1);
      }
    }
    else {
      await handleCustomer(tenant, fromDate, i+1);
    }
  }
}

async function syncPriceList() {
  if (!process.env.npm_config_user) {
    console.log(`No tenant user found. Run "npm run initialDataImport -user=<user_name>"`);
    return;
  }

  const tenantService = new TenantService();
  const tenant = tenantService.getTenantByUser(process.env.npm_config_user as string);
  console.log(`tenant: `, JSON.stringify(tenant, null, ' '));

  const fromDate = moment().subtract(3, 'years');

  if (!tenant) {
    messageLog(process.env.npm_config_user, 'Tenant not found in config');
    return;
  }

  try {
    messageLog(tenant.user, `-- Start of price list import`);
    const priceList = await loadPriceList(tenant, (process.env.npm_config_group || 2) as number, fromDate);
    const jsonFilename = `./data/${tenant.user}-price-list-${fromDate.format('DD.MM.YYYY')}.json`;
    fs.writeFileSync(jsonFilename, priceList);

    console.log(`priceList: `, JSON.stringify(priceList, null, ' '));
  }
  catch (e: any) {
    messageLog(process.env.npm_config_user, 'ERROR initial data import: ' + e.message);
  }

  messageLog(tenant.user, `-- End price list import`);
}

async function syncDiscount() {
  if (!process.env.npm_config_user) {
    console.log(`No tenant user found. Run "npm run initialDataImport -user=<user_name>"`);
    return;
  }

  const tenantService = new TenantService();
  const tenant = tenantService.getTenantByUser(process.env.npm_config_user as string);
  console.log(`tenant: `, JSON.stringify(tenant, null, ' '));

  const fromDate = moment().subtract(3, 'years');

  if (!tenant) {
    messageLog(process.env.npm_config_user, 'Tenant not found in config');
    return;
  }

  try {
    messageLog(tenant.user, `-- Start of discount import`);

    await handleCustomer(tenant, fromDate, 0);
  }
  catch (e: any) {
    messageLog(process.env.npm_config_user, 'ERROR initial data import: ' + e.message);
  }

  messageLog(tenant.user, `-- End discount import`);
}

// syncDiscount();
syncPriceList();
