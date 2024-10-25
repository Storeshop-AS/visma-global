import moment from 'moment';

import * as config from 'config';
import { messageLog } from './index.service';

const axios = require('axios'); //.default;

const TIMEOUT = 2 * 60 * 1000;
axios.defaults.timeout = TIMEOUT;

export class DiscountService {
  public config: any;

  constructor() {
    this.config = config;
  }

  /**
    * @param  {any} tenant
    * @returns { * }
    */
  public getPriceDiscounts(tenant: any, customerNo: any) {
    const body = `<?xml version="1.0" encoding="UTF-8" ?>
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

    return axios.post(url, body, config);
  }

  /**
   * @param  {any} discounts that need to transform
   * @param  {any} tenant
   */
  public async loaddiscountsToXp(discounts: any, tenant: any) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from('su' + ":" + 'tpwcom62020').toString("base64")
    }
    const url = tenant.url + '/visma-global-discounts';
    messageLog(tenant.user, `  POST ${url}`);
    return await axios.post(url, discounts, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
  }

  public articleToXpProduct(discountData: any): any {
    let discounts = [];
    if (discountData?.Articlelist?.Article) {
      for (const article of discountData.Articlelist.Article) {
        const product = {
          displayName: article?.name?.[0],
          data: {
            ExternalId: article?.articleid?.[0] || '',
            price: parseFloat(article?.price1?.[0] || 0),
            stock: parseInt(article['StockSurvey.Available']?.[0] || 0, 10),
            accountingLastChanged: article.LastUpdate?.[0],
            IsActive: article?.inactiveyesno?.[0] === '0'
          }
        };
        if (product.data.IsActive) {
          discounts.push(product);
        }
      }
    }

    return discounts;
  }

  public getFormattedDiscounts(discountData: any, fromDate: moment.Moment): any {
    let discounts = [];
    const _fromDate = fromDate.format('YYYY-MM-DD');
    if (discountData?.PriceMatrix?.Prices?.Price) {
      for (const discount of discountData?.PriceMatrix?.Prices?.Price) {
        const updated = discount?.LastUpdate?.[0] || '';
        if (updated > _fromDate) {
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
