import { Request, Response, Router } from 'express';
import moment from 'moment';

import { loadCustomerData } from '../../app/customer/customer';
import { loadProductData } from '../../app/product/product';
import { vismaGlobalUpdateToXp } from '../../services/xp.service';

import { TenantService, messageLog } from "../../services/index.service";

const router: Router = Router({mergeParams: true});

class ManualSyncController {
  async get(req: Request, res: Response) {
    messageLog('user', `Manual sync called`);

    let user = '';
    const queryParams = req?.query || [];
    if (queryParams) {
      user = (queryParams?.user || '') as string;
    }

    if (!user) {
      messageLog(user, 'User not found in request params');
      return res.status(200).send({
        status: 500,
        message: 'User not found in request params'
      });
    }

    const tenantService = new TenantService();
    const tenant = tenantService.getTenantByUser(user);

    if (!tenant) {
      messageLog(user, 'Tenant not found in config');
      return res.status(200).send({
        status: 500,
        message: 'Tenant not found in config'
      });
    }

    const fromDate = moment().subtract(3, 'years');

    try {
      messageLog(tenant.user, `-- Start of data sync from ${fromDate.format('DD.MM.YYYY')}`);

      const customers = await loadCustomerData(tenant, fromDate);
      messageLog(tenant.user, `Received ${customers && customers.length} customers`);

      const products = await loadProductData(tenant, fromDate);
      messageLog(tenant.user, `Received ${products && products.length} products`);

      const xpResponse = await vismaGlobalUpdateToXp(tenant, customers, products);
      console.log(xpResponse?.data || 'No response found!');

      return res.status(200).send({
        status: 200,
        message: 'The sync is being processed internally and will take a few minutes.'
      });
    }
    catch (e: any) {
      messageLog(tenant.user, 'ERROR data sync: ' + e);
    }
  }
}

const controller = new ManualSyncController();

router.get('/', controller.get);

export const manualSyncController: Router = router;
