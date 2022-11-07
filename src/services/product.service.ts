import { get, post, put } from 'request-promise-native'
import * as config from "config";
import * as parser from 'xml2json';
import * as fs from 'fs';
import moment from 'moment';
import { messageLog } from './index.service';

const axios = require('axios').default;

const TIMEOUT = 120 * 60 * 1000;

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
    public async getProductsFromVismaGlobal(token: any, companyId: any, tenant: any) {
        const vismaGlobalConfig: any = this.config.vismaGlobal;

        const body: any = `<?xml version="1.0" encoding="utf-8" ?>
                            <Articleinfo>
                                <ClientInfo>
                                    <Clientid>${companyId}</Clientid>
                                    <Token>${token}</Token>
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

        const url = vismaGlobalConfig.api + "/Article.svc/GetArticles";

        let returnResult: any[] = [];
        await post({
            url,
            body,
            json: false,
          })
          .then((result: any) => {
            messageLog(tenant.user, `POST ${url} [${token}] (${companyId}) SUCCESS`);
            const JsonResult = JSON.parse(parser.toJson(result));
            const filename = `./data/${tenant.user}-products-raw-${moment().format('YYYY.DD.MM-HH:mm:ss')}.json`;
            fs.writeFileSync(filename, JSON.stringify(JsonResult, null, ' '));
            messageLog(tenant.user, `W ${filename}`);
            if (JsonResult.Articlelist.Article && JsonResult.Articlelist.Article.length > 0) {
              messageLog(tenant.user, `Received ${JsonResult.Articlelist.Article.length} products`);
              returnResult = JsonResult.Articlelist.Article;
            }
            return [];
          })
          .catch((err: any) => {
            messageLog(tenant.user, `POST ${url} [${token}] (${companyId}) FAILED: ${err}`);
          });
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
    public async getProductsFromVismaGlobalByDateChunk(token: string, clientId: any, fromDate: string, toDate: string) {
        const vismaGlobalConfig: any = this.config.vismaGlobal;
        const body: any = `<?xml version="1.0" encoding="UTF-8" ?>
                            <Articleinfo>
                                <ClientInfo>
			   	    <Clientid>${clientId}</Clientid>
				    <Token>${token}</Token>
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


        fs.writeFileSync(`./product-${fromDate}-request.xml`, body);
	messageLog(clientId, `W ./product-${fromDate}-request.xml`);
	messageLog(clientId, `POST ${vismaGlobalConfig.api}/Article.svc/GetArticles`);
	let JsonResult = {Articlelist: []};
	await axios.post(vismaGlobalConfig.api + '/Article.svc/GetArticles', body, { timeout: TIMEOUT })
          .then((result: any) => {
            const filename = `./data/product-${fromDate}-result.xml`;
            fs.writeFileSync(filename, result);
            messageLog(clientId, `W ${filename}`);
            JsonResult = <any>JSON.parse(parser.toJson(result.data));
            fs.writeFileSync(`./data/product-${fromDate}-result.json`, JSON.stringify(JsonResult, null, ' '));
            messageLog(clientId, `W ./data/product-${fromDate}-result.json`);
          })
          .catch((err: any) => {
	    messageLog(clientId, `ERR: ${err}`);
          });
	// console.log(JsonResult);

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
        return JsonResult.Articlelist || [];
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

      const results: any = [];
      let successfulEntryCount = 0;
      let failedEntryCount = 0;

      messageLog(tenant.user, `Loading ${Products.length} to XP`);
      for (const product of Products) {
        const body = product;
        let result;
	await put({url: this.config.basicConfig.beBaseUrl + "/articles", body, headers, json: true })
	  .then((result) => {
	  messageLog(tenant.user, `U ${product.Name} (${typeof product.Name}) [${product.Id}]`);
            results.push(result);
            successfulEntryCount++;
	  })
	  .catch((err) => {
            messageLog(tenant.user, `E ${product.Name} (${typeof product.Name}) [${product.Id}]: ${err}`);
            failedEntryCount++;
	  });
      }
      messageLog(tenant.user, `Finished ${Products.length} to XP`);
      return {success: true, results, successfulEntryCount, failedEntryCount};
    }

    /**
     * @param  {any} customers
     */
    public productsDataTransformation(products: any) {
      const transformedData = [];
      for (const product of products) {
        transformedData.push({
          Id: product.articleid.toString(),
          Name: product.name || `Name not provided (${product.articleid})`,
          Number: product.articleid,  // mandatory field to create a product
          IsActive: product.inactiveyesno === "0" ? true : false,
          Price: parseFloat(product.price1 || 0),
          Updated: product.LastUpdate,
        })
      }
      return transformedData;
    }
}
