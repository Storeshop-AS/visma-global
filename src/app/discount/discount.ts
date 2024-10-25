import * as fs from 'fs';
import moment from 'moment';
import { DiscountService, messageLog } from '../../services/index.service';

const xml2js = require('xml2js');

/**
 * @param {any} tenant
 */
export async function loadDiscountData(tenant: any, fromDate: moment.Moment) {
  const discountService = new DiscountService();

  messageLog(tenant.user, `loadProductData(${fromDate.format('DD.MM.YYYY')})`);
  try {
    const _fromDate = fromDate.format('DD.MM.YYYY');
    const discountRawData = await discountService.getPriceDiscounts(tenant);
    if (discountRawData) {
      const filename = `./data/${tenant.user}-discounts-${_fromDate}.xml`;
      fs.writeFileSync(filename, discountRawData.data);
      messageLog(tenant.user, `  W ${filename}`);

      const parser = new xml2js.Parser();
      const discountJsonData = await parser.parseStringPromise(discountRawData.data);
      if(discountJsonData) {
        const jsonFilename = `./data/${tenant.user}-discounts-${_fromDate}.json`;
        fs.writeFileSync(jsonFilename, JSON.stringify(discountJsonData, null, ' '));
        messageLog(tenant.user, `  W ${jsonFilename} [${discountJsonData?.Articlelist?.Article?.length} discounts]`);

        // Get formatted discounts to send to XP
        // const discounts = discountService.getFormatteddiscounts(tenant, productJsonData, fromDate);
          
        // const xpFilename = `./data/${tenant.user}-discounts-xp-${_fromDate}.json`;
        // fs.writeFileSync(xpFilename, JSON.stringify(discounts, null, ' '));
        // messageLog(tenant.user, `  W ${xpFilename} [${discounts?.length} discounts]`);

        // return discounts;
      };
      return [];
    };
  }
  catch (error: any) {
    messageLog(tenant.user, 'ERROR discounts import failed: ' + error);
  }   
}
