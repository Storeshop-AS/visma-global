import { get, post, put } from 'request-promise-native'
import * as config from "config";
import * as parser from 'xml2json';
import * as fs from 'fs';
import moment from 'moment';
import { messageLog } from './index.service';

const axios = require('axios').default;

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
                                    <Clientid>${companyId}</Clientid>
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
     * @param  {any} product
     * @param  {any} token
     * @param  {any} companyId
     */
    public async getProductPrice(product: any, token: any, companyId: any) {
        const vismaGlobalConfig: any = this.config.vismaGlobal;

        const body: any = `<?xml version="1.0" encoding="utf-8" ?>
                            <ArticlePriceinfo>
                                <Header>
                                    <ClientId>${companyId}</ClientId>
                                    <Guid>${token}</Guid>
                                </Header>
                                <Status>
                                    <MessageId></MessageId>
                                    <Message></Message>
                                    <MessageDetail></MessageDetail>
                                </Status>
                                <ArticlePrice>
                                    <ProductNo>${product.ProductNo}</ProductNo>
                                    <CustomerNo></CustomerNo>
                                    <PurchasePrice></PurchasePrice>
                                    <CostPrice></CostPrice>
                                    <SalesPrice1></SalesPrice1>
                                    <SalesPrice2></SalesPrice2>
                                    <SalesPrice3></SalesPrice3>
                                </ArticlePrice>
                            </ArticlePriceinfo>`;

        const result = await axios.post(vismaGlobalConfig.api + "/Article.svc/GetArticlePrice", body);
        const JsonResult: any = JSON.parse(parser.toJson(result.data));

        if (JsonResult.ArticlePriceinfo.Status.Message == "OK" &&
            JsonResult.ArticlePriceinfo.ArticlePrice &&
            typeof JsonResult.ArticlePriceinfo.ArticlePrice === 'object'
            && JsonResult.ArticlePriceinfo.ArticlePrice !== null) {

            return JsonResult.ArticlePriceinfo.ArticlePrice;
        }
        return {};
    }

    /**
    * @param  {any} token
    * @param  {any} companyId company id comes from visma business erp system
    * @param  {number} pageNumber
    * @returns { * }
    */
    public async getProductsFromVismaGlobalByDateChunk(tenant: any, clientId: string, fromDate: string, toDate: string) {
        const vismaGlobalConfig: any = this.config.vismaGlobal;
        const body: any = `<?xml version="1.0" encoding="UTF-8" ?>
                            <Articleinfo>
                                <ClientInfo>
                                    <Clientid>${clientId}</Clientid>
                                    <Token>b93b1546-e57d-499c-8320-0d7ff5979552</Token>
                                </ClientInfo>
                                <Filters>
                                    <ChangedDate Operator="" Value1="${fromDate}" Compare="GreaterThanOrEqualTo"/>
                                    <ChangedDate Operator="AND" Value1="${toDate}" Compare="LessThanOrEqualTo"/>
                                    <ProcessingMethod7 Operator = "AND" Value1 = "1" Compare = "EqualTo" />
                                </Filters>
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

        const result = await axios.post(vismaGlobalConfig.api + "/Article.svc/GetArticles", body);
        const JsonResult: any = JSON.parse(parser.toJson(result.data));
console.log(JsonResult);
        fs.writeFileSync(`./product-${fromDate}.json`, JSON.stringify(JsonResult, null, ' '));

/*
        let products = [];
        if (JsonResult.Articleinfo && JsonResult.Articleinfo.Status.Message == "OK" &&
            JsonResult.Articleinfo.Article &&
            Array.isArray(JsonResult.Articleinfo.Article) &&
            JsonResult.Articleinfo.Article.length > 0) {

            products = JsonResult.Articleinfo.Article;
            console.log("Started Calling of price api. Total products = ", products.length);
            for (let i = 0; i < products.length; i++) {
                const priceObj = await this.getProductPrice(products[i], token, companyId);
                products[i] = {
                    ...products[i],
                    ...priceObj
                }
                process.stdout.write(i + ',')
                products.length == i + 1 && process.stdout.write('\n');
            }
        }
*/
        return JsonResult.Articlelist;
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

                } catch (error: any) {
                    failedEntryCount++;
                    console.log('Error :>> ', error.message, error.options);
                    messageLog(tenant.user, "Product ID = " + product.Id + ", BE Response =  false");
                }
                results.push(result);
            }
            return { success: true, results, successfulEntryCount, failedEntryCount };
        } catch (error) {
            messageLog(tenant.user, 'ERROR: Loading products to XP');
console.log(error);
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
                Updated: product.LastUpdate,
            })
        }
        return transformedData;
    }
}
