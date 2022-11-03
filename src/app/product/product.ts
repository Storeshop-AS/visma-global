import * as fs from 'fs';
import moment from 'moment';
import { ProductService, messageLog } from '../../services/index.service';

/**
 * Get all products from visma global using API and load to XP
 * @param  {any} tenant
 * @param  {any} tokenInfo  { access_token: '..', companyId:'...', ...}
 */
export async function productEtlProcess(tenant: any, tokenInfo: any) {
  const companyId = tenant.clientId;
  const token = tokenInfo.access_token;
  const productService = new ProductService();
  try {
  const products: any = await productService.getProductsFromVismaGlobal(token, companyId, tenant);

    messageLog(tenant.user, `Received ${products?.length} products`);
    const filename = `./data/${tenant.user}-products-${moment().format('YYYY.DD.MM-HH:mm:ss')}.json`;
    fs.writeFileSync(filename, JSON.stringify(products, null, ' '));
    messageLog(tenant.user, `W ${filename}`);

    const tranformedFilename = `./data/${tenant.user}-products-transformed-${moment().format('YYYY.DD.MM-HH:mm:ss')}.json`
    const transformedProdData = productService.productsDataTransformation(products);
    fs.writeFileSync(tranformedFilename, JSON.stringify(transformedProdData, null, ' '));
    messageLog(tenant.user, `W ${tranformedFilename}`);
    const result = await productService.loadProductsToXp(transformedProdData, tenant);
    messageLog(tenant.user, 'Products import status - Total: ' + products.length + ', Successfully synchronized: ' + result.successfulEntryCount + ', Failed to synchronized: ' + result.failedEntryCount + '  \n');
  } catch (error: any) {
    messageLog(tenant.user, 'Product import failed.' );
    messageLog(tenant.user, error);
  }
}

/**
 * @param  {any} tenant
 * @param  {any} tokenInfo
 */
export async function loadInitialProductData(tenant: any, tokenInfo: any) {
  const dayChunk = 10000;
  const token = tokenInfo.access_token;
  const productService = new ProductService();
  let fromDate = moment('01.01.2015', 'DD.MM.YYYY').format('DD.MM.YYYY');
  let toDate = moment(fromDate, 'DD.MM.YYYY').add(dayChunk, 'd').format('DD.MM.YYYY');

  let page = 1;

  while (1) { 
    try {
      const products: any = await productService.getProductsFromVismaGlobalByDateChunk(token, tenant.clientId, fromDate, toDate);
      const transformedProducts = productService.productsDataTransformation(products.Article);

      // messageLog(tenant.user, `Received ${products?.Article?.length} products`);
      fs.writeFileSync(`./data/${tenant.user}-products-original.json`, JSON.stringify(products, null, ' '));
      fs.writeFileSync(`./data/${tenant.user}-products-transformed.json`, JSON.stringify(transformedProducts, null, ' '));
      const result = await productService.loadProductsToXp(transformedProducts, tenant);

      break;

      if (moment().isBefore(moment(fromDate, 'DD.MM.YYYY'))) {
        break;  
      }     
      // const transformedProdData = productService.productsDataTransformation(products);

/*
      if (result.failedEntryCount === 0) {
        messageLog(tenant.user, 'From ' + fromDate + ' to ' + toDate + ', Products imported successfully - Total: ' + products.length + ', Successfully synchronized: ' + result.successfulEntryCount + ', Failed to synchronized: ' + result.failedEntryCount + '  \n');
      } else {
        messageLog(tenant.user, 'From ' + fromDate + ' to ' + toDate + ', Products import status - Total: ' + products.length + ',  Successfully synchronized: ' + result.successfulEntryCount + ', Failed to synchronized: ' + result.failedEntryCount + '  \n');
      }     
*/

      fromDate = toDate;
      toDate = moment(fromDate, 'DD.MM.YYYY').add(dayChunk, 'd').format('DD.MM.YYYY');

      page++;
    } catch (error: any) {
      messageLog(tenant.user, 'From ' + fromDate + ' to ' + toDate + ', Products import failed. Error message: ' + error.message + '\n');
    }   
  } 
}
