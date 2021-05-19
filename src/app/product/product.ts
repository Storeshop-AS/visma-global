
import moment from "moment"
import { ProductService, messageLog } from "../../services/index.service";

/**
 * Get all products from visma global using API and load to XP
 * @param  {any} tenant
 * @param  {any} tokenInfo  { access_token: '..', companyId:'...', ...}
 */
export async function productEtlProcess(tenant: any, tokenInfo: any) {

    const companyId = tokenInfo.companyId; // Client ID == companyId
    const token = tokenInfo.access_token;
    const productService = new ProductService();
    try {

        const products = await productService.getProductsFromVismaGlobal(token, companyId);
        const transformedProdData = productService.productsDataTransformation(products);
        const result = await productService.loadProductsToXp(transformedProdData, tenant);
        messageLog(tenant.user, "Products import status - Total: " + products.length + ", Successfully synchronized: " + result.successfulEntryCount + ", Failed to synchronized: " + result.failedEntryCount + "  \n");

    } catch (error: any) {
        messageLog(tenant.user, "Product import failed." );
        messageLog(tenant.user, error);
    }
}