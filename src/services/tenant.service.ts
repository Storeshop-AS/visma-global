import * as config from "config";

export class TenantService {

    public config: any;
    public allTenants: any = [];

    constructor() {
        this.config = config;
        this.allTenants = this.config.tenants;
    }

    public getTenantByUser(userId: string) {

        for (const tenant of this.allTenants) {
            if (tenant.user.toLowerCase() === userId.toLowerCase()) {
                return tenant;
            }
        }
        return;
    }

    public getTenantsByIntegration(integrationType: string) {
        return this.allTenants.filter((tenant: any) => tenant.integration === integrationType );
    }

}
