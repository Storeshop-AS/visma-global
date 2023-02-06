import * as fs from 'fs';
import moment from 'moment';
import {ProductService, messageLog} from '../../services/index.service';

const xml2js = require('xml2js');

export async function uploadProductsToXp(products: any, tenant: any) {
  const productService = new ProductService();
  const uploadResult = await productService.loadProductsToXp(products, tenant)
    .then((result) => {
      messageLog(tenant.user, `  Products (${products?.length}) uploaded XP (${result.status})`);
    })
    .catch((err) => {
      messageLog(tenant.user, `  ERROR uploadProductsToXp(): ${err}`);
    });
  return uploadResult;
}

/**
 * @param {any} tenant
 */
export async function loadProductData(tenant: any, fromDate: moment.Moment) {
  const productService = new ProductService();

  let failed = false;

  // NOTES on 2. February 2023:
  // The LastUpdate date filter for Visma Global doesn't actually work,
  // so we will receive all records for every request.
  // With the updated XP service we will only update records that has actually changed.

  try {
    const _fromDate = fromDate.format('DD.MM.YYYY');
    await productService.getProductsFromVismaGlobalByDateChunk(tenant, _fromDate)
      .then(async (result: any) => {
        const filename = `./data/${tenant.user}-products-${_fromDate}.xml`;
        fs.writeFileSync(filename, result.data);
        messageLog(tenant.user, `  W ${filename}`);

        const parser = new xml2js.Parser();
        await parser.parseStringPromise(result.data)
          .then((result: any) => {
            const jsonFilename = `./data/${tenant.user}-products-${_fromDate}.json`;
            fs.writeFileSync(jsonFilename, JSON.stringify(result, null, ' '));
            messageLog(tenant.user, `  W ${jsonFilename} [${result?.Articlelist?.Article?.length} products]`);

            // Get formatted products to send to XP
            const products = productService.getFormattedProducts(tenant, result, fromDate);
            const xpFilename = `./data/${tenant.user}-products-xp-${_fromDate}.json`;

            fs.writeFileSync(xpFilename, JSON.stringify(products, null, ' '));
            messageLog(tenant.user, `  W ${xpFilename} [${products?.length} products]`);

            uploadProductsToXp(products, tenant);
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
}
