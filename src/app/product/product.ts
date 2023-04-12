import * as fs from 'fs';
import moment from 'moment';
import { ProductService, messageLog } from '../../services/index.service';

const xml2js = require('xml2js');

/**
 * @param {any} tenant
 */
export async function loadProductData(tenant: any, fromDate: moment.Moment) {
  const productService = new ProductService();

  // NOTES on 2. February 2023:
  // The LastUpdate date filter for Visma Global doesn't actually work,
  // so we will receive all records for every request.
  // With the updated XP service we will only update records that has actually changed.

  messageLog(tenant.user, `loadProductData(${fromDate.format('DD.MM.YYYY')})`);
  try {
    const _fromDate = fromDate.format('DD.MM.YYYY');
    const productRawData = await productService.getProductsFromVismaGlobalByDateChunk(tenant, _fromDate);
    if (productRawData) {
      const filename = `./data/${tenant.user}-products-${_fromDate}.xml`;
      fs.writeFileSync(filename, productRawData.data);
      messageLog(tenant.user, `  W ${filename}`);

      const parser = new xml2js.Parser();
      const productJsonData = await parser.parseStringPromise(productRawData.data);
      if(productJsonData) {
        const jsonFilename = `./data/${tenant.user}-products-${_fromDate}.json`;
        fs.writeFileSync(jsonFilename, JSON.stringify(productJsonData, null, ' '));
        messageLog(tenant.user, `  W ${jsonFilename} [${productJsonData?.Articlelist?.Article?.length} products]`);

        // Get formatted products to send to XP
        const products = productService.getFormattedProducts(tenant, productJsonData, fromDate);
          
        const xpFilename = `./data/${tenant.user}-products-xp-${_fromDate}.json`;
        fs.writeFileSync(xpFilename, JSON.stringify(products, null, ' '));
        messageLog(tenant.user, `  W ${xpFilename} [${products?.length} products]`);

        return products;
      };
    };
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR products import failed: ' + error);
  }   
}
