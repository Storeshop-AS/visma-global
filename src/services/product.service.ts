import moment from 'moment';

import * as config from 'config';
import * as fs from 'fs';
import { messageLog } from './index.service';

const axios = require('axios'); //.default;

const TIMEOUT = 2 * 60 * 1000;
axios.defaults.timeout = TIMEOUT;

export class ProductService {
  public config: any;

  constructor() {
    this.config = config;
  }

  /**
    * @param  {any} companyId company id comes from visma business erp system
    * @param  {number} pageNumber
    * @returns { * }
    */
  public getProductsFromVismaGlobalByDateChunk(tenant: any, fromDate: string) {
    const vismaGlobalConfig: any = this.config.vismaGlobal;
    const body = `<?xml version="1.0" encoding="UTF-8" ?>
       <Articleinfo>
       <ClientInfo>
         <Clientid>${tenant.clientId}</Clientid>
         <Token>${tenant.accessToken}</Token>
       </ClientInfo>
       <Article>
         <articleid></articleid>
         <name></name>
         <maingroupno></maingroupno>
         <maingroupno.name></maingroupno.name>
         <intermediateGroupNo></intermediateGroupNo>
         <intermediateGroupNo.name></intermediateGroupNo.name>
         <subGroupNo></subGroupNo>
         <subGroupNo.name></subGroupNo.name>
         <artTypeNo></artTypeNo>
         <artTypeNo.name></artTypeNo.name>
         <price1></price1>
         <OfferPrice></OfferPrice>
         <StartDateOfferPrice></StartDateOfferPrice>
         <StopDateOfferPrice></StopDateOfferPrice>
         <inactiveyesno></inactiveyesno>
         <LastUpdate>&gt;${fromDate}</LastUpdate>
         <StockSurvey.WarehouseNo></StockSurvey.WarehouseNo>
         <StockSurvey.UnitInStock></StockSurvey.UnitInStock>
         <StockSurvey.Available></StockSurvey.Available>
         </Article>
       </Articleinfo>`;

    const url = vismaGlobalConfig.api + '/Article.svc/GetArticles';
    const filename = `./data/${tenant.user}-${fromDate}-request.xml`;
    fs.writeFileSync(filename, body);
    messageLog(tenant.user, `  POST ${url} (${fromDate})`);
    messageLog(tenant.user, `  W ${filename}`);

    const config = {
      headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
    };

    return axios.post(
        url,
        body,
        config
    );
  }

  /**
   * @param  {any} Products that need to transform
   * @param  {any} tenant
   */
  public async loadProductsToXp(Products: any, tenant: any) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(tenant.user + ":" + tenant.password).toString("base64"),
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
        const IsActive = article?.inactiveyesno?.[0] !== '0';
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
