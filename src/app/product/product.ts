import moment from 'moment';
import { ProductService, messageLog } from '../../services/index.service';
import * as fs from 'fs';

/**
 * Get all products from visma global using API and load to XP
 * @param  {any} tenant
 * @param  {any} tokenInfo  { access_token: '..', companyId:'...', ...}
 */
export async function productEtlProcess(tenant: any, tokenInfo: any) {
  const companyId = tokenInfo.companyId; // Client ID == companyId
  const token = tokenInfo.access_token;
  const productService = new ProductService();
  try {
    const products = await productService.getProductsFromVismaGlobal(token, companyId);
console.log(products);

    // const transformedProdData = productService.productsDataTransformation(products);
    // const result = await productService.loadProductsToXp(transformedProdData, tenant);
    // messageLog(tenant.user, 'Products import status - Total: ' + products.length + ', Successfully synchronized: ' + result.successfulEntryCount + ', Failed to synchronized: ' + result.failedEntryCount + '  \n');
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
  const dayChunk = 100;
  const companyId = tokenInfo.companyId;
  const token = tokenInfo.access_token;
  const productService = new ProductService();
  let fromDate = moment('01.01.2015', 'DD.MM.YYYY').format('DD.MM.YYYY');
  let toDate = moment(fromDate, 'DD.MM.YYYY').add(dayChunk, 'd').format('DD.MM.YYYY');

  let page = 1;

  while (1) { 
    try {
      const products = await productService.getProductsFromVismaGlobalByDateChunk(token, companyId, fromDate, toDate);

      fs.writeFileSync(`./data/${tenant.user}-products-${page}`, JSON.stringify(products, null, ' '));

      if (moment().isBefore(moment(fromDate, 'DD.MM.YYYY'))) {
        break;  
      }     
      // const transformedProdData = productService.productsDataTransformation(products);
      // const result = await productService.loadProductsToXp(transformedProdData, tenant);

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
