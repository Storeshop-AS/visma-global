import express from "express";
import moment from "moment";

import { TenantService, messageLog } from "./services/index.service";
import { INTEGRATIONS } from "./models/common.model";
import { loadCustomerData } from "./app/customer/customer";
import { loadProductData } from './app/product/product';
import { loadDiscountData } from './app/discount/discount';
import { vismaGlobalUpdateToXp } from './services/xp.service';

const port: number = 8600;
const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log("Server Started at Port, " + port);

  // This scheduler will run in every 1 hour min for extract data from visma global and load to XP
  const SYNC_INTERVAL = 60 * 60 * 1000; // 60 minutes

  importProductAndCustomerDaemon();
  setInterval(importProductAndCustomerDaemon, SYNC_INTERVAL);

  async function importProductAndCustomerDaemon() {
    const tenantService = new TenantService();
    const tenants = tenantService.getTenantsByIntegration(INTEGRATIONS.vismaGlobal);
    console.log(`VismaGlobal Tenants: ${JSON.stringify(tenants, null, ' ')}`);
  
    for (const tenant of tenants) {
      const fromDate = moment().subtract(7, 'days');
      try {
        messageLog(tenant.user, `-- Start of data sync from ${fromDate.format('DD.MM.YYYY')}`);

        const discounts = await loadDiscountData(tenant, fromDate);
        messageLog(tenant.user, `Received ${discounts && discounts.length} discounts`);

        const customers = await loadCustomerData(tenant, fromDate);
        messageLog(tenant.user, `Received ${customers && customers.length} customers`);

        const products = await loadProductData(tenant, fromDate);
        messageLog(tenant.user, `Received ${products && products.length} products`);

        const xpResponse = await vismaGlobalUpdateToXp(tenant, customers, products);
        console.log(xpResponse?.data || 'No response found!');
      }
      catch (e: any) {
        messageLog(tenant.user, 'ERROR data sync: ' + e);
      }
    }
  }
})
