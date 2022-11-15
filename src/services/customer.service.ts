import moment from "moment";

import * as config from "config";

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
    public getCustomersFromVismaGlobal(token: any, companyId: any) {

        const vismaGlobalConfig: any = this.config.vismaGlobal;

        const body: any = `<?xml version="1.0" encoding="utf-8" ?>
                            <Customerinfo>
                                <ClientInfo>
                                    <Clientid>VitariERP</Clientid>
                                </ClientInfo>
                                <Customer>
                                    <customerId></customerId>
                                    <name></name>
                                    <companyno></companyno>
                                    <telephone></telephone>
                                    <emailaddress></emailaddress>
                                    <CustomerGrpNo>4</CustomerGrpNo>
                                    <LastUpdate></LastUpdate>
                                    <ZUsrSuperOfficeID></ZUsrSuperOfficeID>
                                    <invoiceaddress.InvoiceAddressPostCode/>
                                </Customer>
                            </Customerinfo>`;

        return axios.post(
            vismaGlobalConfig.api + "/Customer.svc/GetCustomers",
            body,
            {json: false},
        );
/*
        const JsonResult = JSON.parse(parser.toJson(result));
        let returnResult = [];
        if (JsonResult.Customerlist.Customer && JsonResult.Customerlist.Customer.length > 0) {
            returnResult = JsonResult.Customerlist.Customer;
        }
        return returnResult;
*/
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
    public customerDataTransformation(customers: any) {

        const transformedData = [];
        for (const customer of customers) {

            let postalCode = customer.InvoiceAddresses.InvoiceAddress['invoiceaddress.InvoiceAddressPostCode'];

            transformedData.push({
                Id: customer.customerId,
                Name: customer.name,
                CustomerNumber: customer.customerId,    // mandatory field to create a customer
                EmailAddress: typeof customer.emailaddress !== 'object' && customer.emailaddress !== null ? customer.emailaddress : null,
                InvoicePostalCode: typeof postalCode !== 'object' && postalCode !== null ? postalCode : null,
                ContactPersonPhone: typeof customer.telephone !== 'object' && customer.telephone !== null ? customer.telephone : null
            })

        }
        return transformedData;

    }

}
