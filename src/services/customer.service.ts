import moment from "moment";

import * as config from "config";
import * as fs from 'fs';
import { messageLog } from "./index.service";

const axios = require('axios').default;

export class CustomerService {
  public config: any;
  
  constructor() {
    this.config = config;
  }

  /**
   * @param  {any} token
   * @param  {any} companyId
   * @returns { * }
   */
  public getCustomersFromVismaGlobal(tenant: any, fromDate: string) {
    const body: any = `<?xml version="1.0" encoding="UTF-8"?>
      <Customerinfo>
        <ClientInfo>
          <Clientid>${tenant.clientId}</Clientid>
          <Token>${tenant.accessToken}</Token>
        </ClientInfo>
        <Status>
          <MessageId/>
          <Message/>
          <MessageDetail/>
        </Status>
        <Customer>
          <AssociateNo/>
          <CustomerNo/>
          <InvoiceCustomerNo/>
          <SendToAssociateNo/>
          <Name/>
          <ShortName/>
          <Mobile/>
          <Phone/>
          <Fax/>
          <EmailAddress/>
          <WebPage/>
          <CompanyNo/>
          <CountryCode/>
          <LanguageCode/>
          <BankAccountNo/>
          <PaymentTerms/>
          <AddressLine1/>
          <AddressLine2/>
          <AddressLine3/>
          <AddressLine4/>
          <PostCode/>
          <PostalArea/>
          <VisitPostCode/>
          <VisitPostalArea/>
          <ChangedDate/>
          <CustomerGrpNo/>
        </Customer>
      </Customerinfo>`;

    messageLog(tenant.user, `getCustomersFromVismaGlobal() [${tenant.api}]`)
    const url = tenant.api + "/Customer.svc/GetCustomers";
    const filename = `./data/${tenant.user}-${fromDate}-customer-request.xml`;
    fs.writeFileSync(filename, body);
    messageLog(tenant.user, `  POST ${url} (${fromDate})`);
    messageLog(tenant.user, `  W ${filename}`);
  
    const config = {
      headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
    };
    axios.defaults.timeout = 380000; // Set default timeout to 5 seconds
    return axios.post(url, body, config);
  }

  /**
   * @param  {any} customers
   */
  public getFormattedCustomers(customerData: any): any {
    let customers = [];
    if (customerData?.Customerlist?.Customer) {
      for (const customer of customerData?.Customerlist?.Customer) {
        const name = customer?.Name?.[0] || '';
        const CustomerNo = customer?.CustomerNo?.[0] || '';
        const EmailAddress = customer?.EmailAddress?.[0] || '';
        const CompanyNo = customer?.CompanyNo?.[0] || '';
        const postalcode = customer?.PostCode?.[0] || '';

        if (name.length > 0 && CustomerNo.length > 0) {
          customers.push({
            Id: CustomerNo,
            name,
            CustomerNumber: CustomerNo,  // mandatory field to create a customer
            EmailAddress,
            CompanyNo,
            postalcode
          });
        }
      }
    }

    return customers;
  }
}
