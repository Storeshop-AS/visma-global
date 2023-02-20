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
        const vismaGlobalConfig: any = this.config.vismaGlobal;

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
                </Customer>
            </Customerinfo>`;

        const url = vismaGlobalConfig.api + "/Customer.svc/GetCustomers";
        const filename = `./data/${tenant.user}-${fromDate}-customer-request.xml`;
        fs.writeFileSync(filename, body);
        messageLog(tenant.user, `  POST ${url} (${fromDate})`);
        messageLog(tenant.user, `  W ${filename}`);
    
        const config = {
          headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
        };
    
        return axios.post(url, body, config);
    }

    /**
     * @param  {any} customers Transformation customers
     * @param  {any} tenant
     */
    public async loadCustomersToXp(customers: any, tenant: any) {
        const headers = {
            "Authorization": "Basic " + Buffer.from(tenant.user + ":" + tenant.password).toString("base64"),
            "Content-Type": "application/json",
        }

        const results = [];
        let successfulEntryCount = 0;
        let failedEntryCount = 0;

        try {
            for (const customer of customers) {
                const body: any = customer;
                let result;
                try {
                    result = await axios.put(
                        this.config.basicConfig.beBaseUrl + "/customers",
                        body,
                        {headers, json: true}
                    );

                    if (result.success) {
                        successfulEntryCount++;
                    } else {
                        failedEntryCount++;
                    }

                    messageLog(tenant.user, "Customer ID = " + customer.Id + ", BE Response = " + result.success);

                } catch (error: any) {
                    failedEntryCount++;
                    console.log('Error :>> ', error.message, error.options);
                    messageLog(tenant.user, "Customer ID = " + customer.Id + ", BE Response =  false");
                }

                results.push(result);
            }
            return { success: true, results, successfulEntryCount, failedEntryCount };

        } catch (error) {
            return { success: false, results, error };
        }
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
                        CustomerNumber: CustomerNo,    // mandatory field to create a customer
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
