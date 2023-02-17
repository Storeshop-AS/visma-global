import * as config from "config";

import { Order } from '../entity/order'
import { Orderline } from '../entity/orderline'

const axios = require('axios').default;

export class OrderService {
    public config: any;

    constructor() {
        this.config = config;
    }

    public orderDataTransformation(order: Order, lines: Orderline[]) {
        const linesData = [];
        for (const line of lines) {
            linesData.push({
                operation: "Insert",
                inventoryId: {
                    value: line.ExternalId
                },
                inventoryNumber: {
                    value: line.No
                },
                quantity: {
                    value: line.quantity
                },
                unitPrice: {
                    value: line.price
                },
                uom: {
                    value: "STK"
                },
                discountPercent: {
                    value: line.discount
                },
                lineDescription: {
                    value: line.Name
                }
            })
        }

        const transformedOrderData = {
            lines: linesData,
            orderType: {
                value: "SO",
            },
            orderNumber: {
                value: order.OrderNumber,
            },
            hold: {
                value: true,
            },
            date: {
                value: order.created,
            },
            requestOn: {
                value: order.created,
            },
            customer: {
                value: order.CustomerNumber,
            },
            currency: {
                value: "NOK",
            },
        };

        return transformedOrderData;

    }
    
    /**
     * @param  {any} orders Transformed orders
     * @param  {any} tenant
     * @param  {any} tokenInfo tokenInfo = { access_token: '..', companyId:'...', ...}
     * 
     */
    public async loadOrderToVisma(orders: any, tenant: any, tokenInfo: any) {
        const headers = {
            "Authorization": "Bearer " + tokenInfo.access_token,
            "Content-Type": "application/json",
            "ipp-company-id": tokenInfo.companyId
        }

        try {
            const body: any = orders;
            const result = await axios.post(
                tenant.api + "/salesorderbasic",
                body,
                { headers, json: true },
            );
            return { success: true, message: "Successfully order is created" };

        } catch (error: any) {
            return { success: false, message: error.message };
        }

    }
}
