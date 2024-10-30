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
export async function loadPriceList(tenant: any, groupId: number, fromDate: moment.Moment) {
  const discountService = new DiscountService();
  try {
    const _fromDate = fromDate.format('DD.MM.YYYY');
    const priceListRawData = await discountService.getPriceList(tenant, groupId, _fromDate);
    const xmlFilename = `./data/${tenant.user}-price-list-${_fromDate}.xml`;
    fs.writeFileSync(xmlFilename, priceListRawData.data);
    if (priceListRawData) {
      const parser = new xml2js.Parser();
      const discountJsonData = await parser.parseStringPromise(priceListRawData.data);
      // const jsonFilename = `./data/${tenant.user}-price-list-${_fromDate}.json`;
      // fs.writeFileSync(jsonFilename, discountJsonData);
      if(discountJsonData && discountJsonData?.PriceMatrix && discountJsonData?.PriceMatrix?.Prices) {
        return discountService.getFormattedPriceList(discountJsonData, _fromDate);
      }
    }
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR price list import failed: ' + error);
  }
}
