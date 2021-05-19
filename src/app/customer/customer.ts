import { CustomerService, messageLog } from "../../services/index.service";

/**
 * Get all customers from visma global using API and store to Enonic XP.
 * @param  {any} tenant
 * @param  {any} tokenInfo  { access_token: '..', companyId:'...', ...}
 */
export async function customerEtlProcess(tenant: any, tokenInfo: any) {
    const companyId = tokenInfo.companyId;
    const token = tokenInfo.access_token;
    const customerService = new CustomerService();
    try {
        const customers = await customerService.getCustomersFromVismaGlobal(token, companyId);
        const transformedCusrData = customerService.customerDataTransformation(customers);
        const result = await customerService.loadCustomersToXp(transformedCusrData, tenant);
        messageLog(tenant.user, "Customers import status - Total: " + customers.length + ",  Successfully synchronized: " + result.successfulEntryCount + ", Failed to synchronized: " + result.failedEntryCount + "  \n");

    } catch (error) {
        messageLog(tenant.user, "Customer import failed.");
        messageLog(tenant.user, error);
    }
}
