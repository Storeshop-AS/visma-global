import { Request, Response, Router } from 'express';
import moment from 'moment';

import { loadDiscountData } from '../../app/discount/discount';
import { TenantService } from '../../services/tenant.service';

const router: Router = Router({mergeParams: true});

class DiscountController {
    async get(req: Request, res: Response) {
        if (!req.query.user) {
            return res.status(500).send({
                message: 'Missing user',
            });
        }

        if (!req.query.customerId) {
            return res.status(500).send({
                message: 'Missing customerId',
            });
        }

        const tenantService = new TenantService();
        const tenant = tenantService.getTenantByUser(req.query.user as string);

        if (!tenant) {
            return res.status(500).send({
                message: 'Tenant not found',
            });
        }

        const fromDate = moment().subtract((req?.query?.duration || 7) as number, (req?.query?.unit || 'days') as moment.unitOfTime.DurationConstructor);

        const discounts = await loadDiscountData(tenant, req.query.customerId, fromDate);
        return res.send({ discounts });
    }
}

const controller = new DiscountController();

router.get('/', controller.get);

export const discountController: Router = router;
