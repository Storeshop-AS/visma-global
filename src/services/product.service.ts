import { get, post, put } from "request-promise-native"
import * as config from "config";
import moment from "moment";
import * as parser from 'xml2json';
import { messageLog } from "./index.service";

export class ProductService {

    public config: any;

    constructor() {
        this.config = config;
    }

    /**
     * @param  {any} token
     * @param  {any} companyId company id comes from visma global system
     * @returns { * }
     */
    public async getProductsFromVismaGlobal(token: any, companyId: any) {
        const vismaGlobalConfig: any = this.config.vismaGlobal;

        const body: any = `<?xml version="1.0" encoding="utf-8" ?>
                            <Articleinfo>
                                <ClientInfo>
                                    <Clientid>VitariERP</Clientid>
                                    <Token>XXXX-XXXX-XXXX-XXXX-XXXX</Token>
                                </ClientInfo>
                                <Article>
                                    <articleid></articleid>
                                    <name></name>
                                    <maingroupno></maingroupno>
                                    <maingroupno.name></maingroupno.name>
                                    <intermediateGroupNo></intermediateGroupNo>
                                    <intermediateGroupNo.name></intermediateGroupNo.name>
                                    <subGroupNo></subGroupNo>
                                    <subGroupNo.name></subGroupNo.name>
                                    <artTypeNo></artTypeNo>
                                    <artTypeNo.name></artTypeNo.name>
                                    <price1></price1>
                                    <OfferPrice></OfferPrice>
                                    <StartDateOfferPrice></StartDateOfferPrice>
                                    <StopDateOfferPrice></StopDateOfferPrice>
                                    <inactiveyesno></inactiveyesno>
                                    <LastUpdate></LastUpdate>
                                    <StockSurvey.WarehouseNo></StockSurvey.WarehouseNo>
                                    <StockSurvey.UnitInStock></StockSurvey.UnitInStock>
                                    <StockSurvey.Available></StockSurvey.Available>
                                </Article>
                            </Articleinfo>`;

        const result = await post({
            url: vismaGlobalConfig.api + "/Article.svc/GetArticles",
            body,
            json: false,
        });
        const JsonResult = JSON.parse(parser.toJson(result));
        let returnResult = [];
        if (JsonResult.Articlelist.Article && JsonResult.Articlelist.Article.length > 0) {
            returnResult = JsonResult.Articlelist.Article;
        }
        return returnResult;

    }

    /**
     * @param  {any} Products that need to transform
     * @param  {any} tenant
     */
    public async loadProductsToXp(Products: any, tenant: any) {

        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(tenant.user + ":" + tenant.password).toString("base64"),
        }

        const results = [];
        let successfulEntryCount = 0;
        let failedEntryCount = 0;
        try {
            for (const product of Products) {
                const body = product;
                let result;
                try {
                    result = await put({
                        url: this.config.basicConfig.beBaseUrl + "/articles", body, headers, json: true,
                    });

                    if (result.success) {
                        successfulEntryCount++;
                    } else {
                        failedEntryCount++;
                    }

                    messageLog(tenant.user, "Product ID = " + product.Id + ", BE Response = " + result.success);

                } catch (error) {
                    failedEntryCount++;
                    console.log('Error :>> ', error.message, error.options);
                    messageLog(tenant.user, "Product ID = " + product.Id + ", BE Response =  false");
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
    public productsDataTransformation(products: any) {

        const transformedData = [];
        for (const product of products) {
            transformedData.push({
                Id: product.articleid.toString(),
                Name: product.name && product.name.trim() || `Name not provided (${product.articleid})`,
                Number: product.articleid,  // mandatory field to create a product
                IsActive: product.inactiveyesno === "0" ? true : false,
                Price: product.price1 || 0,
            })
        }
        return transformedData;
    }
}
