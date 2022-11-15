import { Connection, createConnections, getConnection } from 'typeorm';
import * as config from 'config';
import moment from 'moment'

import { TenantService, messageLog } from '../services/index.service';
import { loadProductData } from '../app/product/product';

async function loadInitialProductData() {
  if (!process.env.npm_config_user) {
    console.log(`No tenant user found. Run "npm run initialDataImport -user=<user_name>"`);
    return;
  }

  const tenantService = new TenantService();
  const tenant = tenantService.getTenantByUser(process.env.npm_config_user as string);
  const fromDate = moment().subtract(3, 'years').format('DD.MM.YYYY');

  if (!tenant) {
    messageLog(process.env.npm_config_user, 'Tenant not found in config');
    return;
  }

  try {
    messageLog(tenant.user, `-- Start of initial data import`);
    await loadProductData(tenant, fromDate, 100);
  } catch (e: any) {
    messageLog(process.env.npm_config_user, 'ERROR initial data import: ' + e.message);
  }

  messageLog(tenant.user, `-- End initial data import`);
}

loadInitialProductData();
