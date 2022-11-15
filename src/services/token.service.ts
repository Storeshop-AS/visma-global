import { getConnection } from "typeorm";
import { Token } from '../entity/token'
import { TenantService } from "./index.service";

import * as config from "config";

export class TokenService {

    private config: any;

    constructor() {
        this.config = config;
    }

    async saveTokenToDB(tenant: any, access_token: string, companyId:string) {
        const now = new Date();
        const repo = getConnection(tenant.user).getRepository('Token')
        const data = <Token> await repo.findOne() || new Token();
        data.access_token = access_token
        data.refresh_token = access_token   // In visma.net, they did not provide the refresh token. access token is saved as refresh token
        data.expires_in = new Date('1970-01-01 08:08:32.736').getTime(), // Just added a time to avoid the error
        data.user = tenant.user
        data.password = tenant.password
        data.companyId = companyId
        data.created = data.created || now
        data.updated = now
        return repo.save(data)
    }

    async getTokenFromDB(db: string): Promise<Token> {
        const repo = getConnection(db).getRepository('Token')
        return await repo.findOne() as Token;
    }

    async deleteToken(db: string) {
        const repo = getConnection(db).getRepository('Token')
        const result = repo.clear()
        return result
    }
}
