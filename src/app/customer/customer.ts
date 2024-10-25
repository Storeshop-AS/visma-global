import * as fs from 'fs';
import moment from 'moment';
import { CustomerService, messageLog } from '../../services/index.service';
import { loadDiscountData } from '../discount/discount';

const xml2js = require('xml2js');

/**
 * Get all customers from visma global using API and store to Enonic XP.
 * @param  {any} tenant
 * @param  {date} fromDate
 */
export async function loadCustomerData(tenant: any, fromDate: moment.Moment) {
  const customerService = new CustomerService();

  try {
    const _fromDate = fromDate.format('DD.MM.YYYY');
    messageLog(tenant.user, `loadCustomerData() [${tenant.api}]`);
    const customerRawData = await customerService.getCustomersFromVismaGlobal(tenant, _fromDate);
    if(customerRawData) {
      const filename = `./data/${tenant.user}-customers-${_fromDate}.xml`;
      fs.writeFileSync(filename, customerRawData.data);
      messageLog(tenant.user, `  W ${filename}`);
  
      const parser = new xml2js.Parser();
      const customerJsonData = await parser.parseStringPromise(customerRawData.data);
      if(customerJsonData) {
        const jsonFilename = `./data/${tenant.user}-customers-${_fromDate}.json`;
        fs.writeFileSync(jsonFilename, JSON.stringify(customerJsonData, null, ' '));
        messageLog(tenant.user, `  W ${jsonFilename} [${customerJsonData?.Customerlist?.Customer?.length} customers]`);
  
        // Get formatted customers to send to XP
        const formattedCustomers = customerService.getFormattedCustomers(customerJsonData);

        const customers: any = [];
        const discountForCustomers: any = [];
        if (formattedCustomers.length > 0) {
          formattedCustomers.forEach(async (customer: any) => {
            const discounts = await loadDiscountData(tenant, customer.Id, fromDate);
            if (discounts) {
              console.log(`discounts: `, JSON.stringify(discounts,  null, ' '));
              discountForCustomers.push({
                Id: customer.Id,
                Name: customer.name,
              });
            }
            customers.push({
              ...customer,
              discounts: [],
            })
          });
        }
        console.log(`discountForCustomers: `, JSON.stringify(discountForCustomers,  null, ' '));

        const dfcFilename = `./data/${tenant.user}-discount-for-customers-${_fromDate}.json`;
        fs.writeFileSync(dfcFilename, JSON.stringify(discountForCustomers, null, ' '));

        const xpFilename = `./data/${tenant.user}-customers-xp-${_fromDate}.json`;
        fs.writeFileSync(xpFilename, JSON.stringify(customers, null, ' '));
        messageLog(tenant.user, `  W ${xpFilename} [${customers?.length} customers]`);
  
        return customers;
      }
      else {
        messageLog(tenant.user, `  **** No data`);
	      console.log(JSON.stringify(customerRawData, null, ' '));
      }
    };
  }
  catch(error: any) {
    messageLog(tenant.user, 'ERROR customers import failed: ' + error);
  }
}
