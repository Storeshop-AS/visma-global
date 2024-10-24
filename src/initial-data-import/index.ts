import moment from 'moment';

import { TenantService, messageLog } from '../services/index.service';
import { loadCustomerData } from '../app/customer/customer';
import { loadProductData } from '../app/product/product';
import { vismaGlobalUpdateToXp } from '../services/xp.service'

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

    const customers = await loadCustomerData(tenant, fromDate);
    messageLog(tenant.user, `Received ${customers && customers.length} customers`);

    const products = await loadProductData(tenant, fromDate);
    // const products = _products.filter((p: any) => {
    //   return p.ExternalId.match(/E901304-400/);
    // });
    console.log(JSON.stringify(products.slice(0, 3), null, ' '));
    messageLog(tenant.user, `Received ${products && products.length} products`);

    const xpResponse = await vismaGlobalUpdateToXp(tenant, customers, products);
    console.log(xpResponse?.data || 'No response found!');
  }
  catch (e: any) {
    messageLog(process.env.npm_config_user, 'ERROR initial data import: ' + e.message);
  }

  messageLog(tenant.user, `-- End initial data import`);
}

loadInitialProductData();
