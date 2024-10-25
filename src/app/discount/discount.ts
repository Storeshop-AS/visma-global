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
        const jsonFilename = `./data/${tenant.user}-discounts-${customerNo}.json`;
        fs.writeFileSync(jsonFilename, JSON.stringify(discountJsonData, null, ' '));

        messageLog(tenant.user, `  W ${jsonFilename} [${discountJsonData?.PriceMatrix?.Prices?.Price?.length} discounts]`);

        // Get formatted discounts to send to XP
        return discountService.getFormattedDiscounts(discountJsonData, fromDate);
      }
      return [];
    }
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR discounts import failed: ' + error);
  }   
}
