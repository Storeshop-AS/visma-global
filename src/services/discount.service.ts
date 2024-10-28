import moment from 'moment';

import * as config from 'config';

const axios = require('axios'); //.default;

const TIMEOUT = 2 * 60 * 1000;
axios.defaults.timeout = TIMEOUT;

export class DiscountService {
  public config: any;

  constructor() {
    this.config = config;
  }

  public getPriceDiscounts(tenant: any, customerNo: any) {
    const body: any = `<?xml version="1.0" encoding="UTF-8" ?>
      <PriceMatrix>
        <ClientInfo>
          <Clientid>${tenant.clientId}</Clientid>
          <Token>${tenant.accessToken}</Token>
        </ClientInfo>
        <Filter>
          <customerNo>${customerNo}</customerNo>
        </Filter>
      </PriceMatrix>`;

    const url = tenant.api + '/Extension.svc/GetPriceMatrix';

    const config = {
      headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
    };

    console.log(`getPriceDiscounts() API Body: `, body);

    return axios.post(url, body, config);
  }

  public getFormattedDiscounts(discountData: any, fromDate: moment.Moment): any {
    let discounts = [];
    const _fromDate = fromDate.format('YYYY-MM-DD');
    if (discountData?.PriceMatrix?.Prices?.Price) {
      for (const discount of discountData?.PriceMatrix?.Prices?.Price) {
        const currentDate = new Date();
        const updated = discount?.LastUpdate?.[0] || '';
        const stopDate = new Date(discount?.StopDate?.[0] || '');

        if (updated > _fromDate && stopDate >= currentDate) {
          discounts.push({
            discountType: discount?.DiscountType?.[0] || '',
            dustomerNo: discount?.CustomerNo?.[0] || '',
            articleNo: discount?.ArticleNo?.[0] || '',
            articlePrice: parseFloat(discount?.ArticlePrice?.[0] || 0),
            agreedPrice: parseFloat(discount?.AgreedPrice?.[0] || 0),
            startDate: discount?.StartDate?.[0] || '',
            stopDate: discount?.StopDate?.[0] || '',
            fromQuantity: parseInt(discount?.FromQuantity?.[0] || 0),
            toQuantity: parseInt(discount?.ToQuantity?.[0] || 0),
            discountI: parseFloat(discount?.DiscountI?.[0] || 0),
            discountII: parseFloat(discount?.DiscountII?.[0] || 0),
            discountIII: parseFloat(discount?.DiscountIII?.[0] || 0),
            lastUpdate: discount?.LastUpdate?.[0] || '',
          });
        }
      }
    }
    return discounts;
  }
}
