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
  public getPriceDiscounts(tenant: any) {
    const body = `<?xml version="1.0" encoding="UTF-8" ?>
      <PriceMatrix>
        <ClientInfo>
          <Clientid>${tenant.clientId}</Clientid>
          <Token>${tenant.accessToken}</Token>
        </ClientInfo>
      </PriceMatrix>`;

    const url = tenant.api + '/Extension.svc/GetPriceMatrix';

    const config = {
      headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
    };

    return axios.post(url, body, config);
  }

  /**
   * @param  {any} Products that need to transform
   * @param  {any} tenant
   */
  public async loadProductsToXp(Products: any, tenant: any) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from('su' + ":" + 'tpwcom62020').toString("base64")
    }
    const url = tenant.url + '/visma-global-products';
    messageLog(tenant.user, `  POST ${url}`);
    return await axios.post(url, Products, {headers, maxContentLength: Infinity, maxBodyLength: Infinity});
  }

  public articleToXpProduct(productData: any): any {
    let products = [];
    if (productData?.Articlelist?.Article) {
      for (const article of productData.Articlelist.Article) {
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
          products.push(product);
        }
      }
    }

    return products;
  }

  public getFormattedProducts(tenant: any, productData: any, fromDate: moment.Moment): any {
    let products = [];
    const _fromDate = fromDate.format('YYYY-MM-DD');
    if (productData?.Articlelist?.Article) {
      for (const article of productData?.Articlelist?.Article) {
        const IsActive = article?.inactiveyesno?.[0] === '0';
        const name = article?.name?.[0] || '';
        const updated = article?.LastUpdate?.[0] || '';

        if (IsActive && name.length > 0 && updated > _fromDate) {
          products.push({
            name,
            ExternalId: article?.articleid?.[0] || '',
            price: parseFloat(article?.price1?.[0] || 0),
            stock: parseInt(article['StockSurvey.Available']?.[0] || 0, 10),
            IsActive
          });
        }
      }
    }

    messageLog(tenant.user, `  filtered ${products.length} products`);
    return products;
  }
}
