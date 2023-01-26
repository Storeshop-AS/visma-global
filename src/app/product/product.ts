import * as fs from 'fs';
import moment from 'moment';
import {ProductService, messageLog} from '../../services/index.service';

const xml2js = require('xml2js');

/**
 * @param {any} tenant
 */
export async function loadProductData(tenant: any, fromDate: string, dayChunk: number) {
  const productService = new ProductService();

  let page = 1;
  let failed = false;
  let toDate = moment(fromDate, 'DD.MM.YYYY').add(dayChunk, 'd').format('DD.MM.YYYY');

  while (!failed && moment().isAfter(moment(fromDate, 'DD.MM.YYYY'))) { 
    try {
      await productService.getProductsFromVismaGlobalByDateChunk(tenant, fromDate, toDate)
        .then((result: any) => {
          fs.writeFileSync(`./data/${tenant.user}-products-${page}.xml`, result.data);
          messageLog(tenant.user, `  W ./data/${tenant.user}-products-${page}.xml`);

          const parser = new xml2js.Parser();
          parser.parseStringPromise(result.data)
            .then((result: any) => {
              fs.writeFileSync(`./data/${tenant.user}-products-${page}.json`, JSON.stringify(result, null, ' '));
              messageLog(tenant.user, `  W ./data/${tenant.user}-products-${page}.json`);

              // Get formatted products to send on XP
              const products = productService.getFormattedProducts(result);
              messageLog(tenant.user, `  Received products (${products.length})`);
              fs.writeFileSync(`./data/${tenant.user}-products-xp-${page}.json`, JSON.stringify(products, null, ' '));

              const xpApiRes = productService.loadProductsToXp(products, tenant);
              messageLog(tenant.user, `  XP API response: ${JSON.stringify(xpApiRes, null, ' ')}`);

              // START - The following codes are not necessary due to create another new API to send direct to XP
              // const products = productService.articleToXpProduct(result);
              // messageLog(tenant.user, `  Received products (${products.length})`);
              // fs.writeFileSync(`./data/${tenant.user}-products-xp-${page}.json`, JSON.stringify(products, null, ' '));
              // messageLog(tenant.user, `  W ./data/${tenant.user}-products-xp-${page}.json`);
              // END
            })
            .catch((err: any) => {
              messageLog(tenant.user, `ERROR xml2js(): ${err}`);
            });
        })
        .catch((err: any) => {
          messageLog(tenant.user, `ERROR productService.getProductsFromVismaGlobalByDateChunk: ${err}`);
          failed = true;
        });
    } catch (error: any) {
      failed = true;
      messageLog(tenant.user, 'ERROR products import failed: ' + error);
    }   

    fromDate = toDate;
    toDate = moment(fromDate, 'DD.MM.YYYY').add(dayChunk, 'd').format('DD.MM.YYYY');
    page++;
  }
}
