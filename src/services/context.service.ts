import { get, post, put } from "request-promise-native";
import * as config from "config";

export class ContextService {
  public config: any;

  constructor() {
    this.config = config;
  }

  /**
   * @param  {any} token
   * @param  {any} companyId
   * @returns { * }
   */
  public getContext(tenant: any, tokenInfo: any) {
    const vismaConfig: any = this.config.vismanet;
    const headers = {
      "Authorization": "Bearer " + tokenInfo.access_token,
      "Content-Type": "application/json",
      "accept": "application/json",
      "ipp-company-id": tokenInfo.companyId,
      "ipp-application-type": "Visma.net Financials"
    }
    console.log(headers);
    console.log(tenant.clientId + ':' + tenant.clientSecret);
    const url = vismaConfig.api.replace(/controller\/api/, 'resources') + "/context/" + tokenInfo.companyId;
    console.log(url);
    return get({ url, json: true, headers });
  }
}
