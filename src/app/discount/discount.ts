import * as fs from 'fs';
import moment from 'moment';
import { DiscountService, messageLog } from '../../services/index.service';

const xml2js = require('xml2js');

/**
 * @param {any} tenant
 * @param {any} customerNo
 * @param {any} fromDate
 */
export async function loadDiscountData(tenant: any, customerNo: any, fromDate: moment.Moment) {
  const discountService = new DiscountService();
  try {
    const discountRawData = await discountService.getPriceDiscounts(tenant, customerNo);
    if (discountRawData) {
      const parser = new xml2js.Parser();
      const discountJsonData = await parser.parseStringPromise(discountRawData.data);
      if(discountJsonData && discountJsonData?.PriceMatrix && discountJsonData?.PriceMatrix?.Prices) {
        return discountService.getFormattedDiscounts(discountJsonData, fromDate);
      }
    }
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR discounts import failed: ' + error);
  }
}

/**
 * @param {any} tenant
 * @param {any} fromDate
 */
export async function loadPriceList(tenant: any, fromDate: moment.Moment) {
  const discountService = new DiscountService();
  try {
    const priceListRawData = await discountService.getPriceList(tenant, fromDate);
    const filename = `./data/${tenant.user}-price-list-${fromDate}.xml`;
    fs.writeFileSync(filename, priceListRawData.data);
    if (priceListRawData) {
      const parser = new xml2js.Parser();
      const discountJsonData = await parser.parseStringPromise(priceListRawData.data);
      const filename = `./data/${tenant.user}-price-list-${fromDate}.json`;
      fs.writeFileSync(filename, discountJsonData);
      if(discountJsonData && discountJsonData?.PriceMatrix && discountJsonData?.PriceMatrix?.Prices) {
        // return discountService.getFormattedDiscounts(discountJsonData, fromDate);
      }
    }
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR discounts import failed: ' + error);
  }
}
