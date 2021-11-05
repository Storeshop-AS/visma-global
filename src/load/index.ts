import * as fs from 'fs';
import * as config from 'config';

import * as xp from '../services/xp.service';

import { Connection, createConnections, getConnection } from 'typeorm';
import { TenantService, TokenService, messageLog } from '../services/index.service';

import { Article } from '../entity/article';

async function load() {
  console.log('Start load process...');

  if (!process.env.npm_config_user) {
    console.log("No user provided. Run 'npm run load -user=<user_name> -file=<filename>'");
    return;
  }

  if (!process.env.npm_config_file) {
    console.log("No file provided. Run 'npm run load -user=<user_name> -file=<filename>'");
    return;
  }

  const tenantService = new TenantService();
  const user = process.env.npm_config_user;
  const tenant = tenantService.getTenantByUser(user);

  const buf = fs.readFileSync(process.env.npm_config_file);

  if (!tenant) {
    messageLog(user, "tenant not found");
    return;
  }

  if (!buf) {
    messageLog(user, "file not found");
    return;
  }

  const  data = JSON.parse(buf.toString());
console.log(tenant);
console.log(data);

  const authorization = 'Basic ' + Buffer.from(tenant.user + ':' + tenant.password).toString('base64');

  const header = {
    'Content-Type': 'application/json',
    'Authorization': authorization
  };

  const repo = getConnection(user).getRepository('Article');

  if (data?.Articlelist?.Article && repo) {
    let i = 0;
    let inactive = 0;
    messageLog(user, `${data.Articlelist.Article.length} products`);

    for (let row of data.Articlelist.Article) {
      const data = await repo.findOne({ ExternalId: row.articleid }) as Article || new Article();

      row.name = typeof row.name === 'string' ? row.name : `No name (${row.articleid})`;

      if (!data.ExternalId) {
        data.ExternalId = row.articleid;
        data.Name = row.name;
        data.Updated = row.LastUpdate;
        data.NetPrice = parseFloat(row.price1);
        data.IsActive = row.inactiveyesno === '0';
        data.StockBalance = row['StockSurvey.Available'];
        const save = await repo.save(data);
        
        if (!data.IsActive) {
          inactive++;
          continue;
        }

        const result = await xp.saveArticle(data, tenant.url, header).then((response: any) => {
          data.Syncronized = true;
        })
        .catch((err: any) => {
          console.log(err);
          data.Syncronized = false;
        });
        const update = await repo.save(data);
        messageLog(user, `A (${row.articleid}) "${row.name}" [${i}]`);
      }
      else {
        const updated1 = new Date(data.Updated).toISOString();
        const updated2 = new Date(row.LastUpdate).toISOString();
        const update = updated1 !== updated2;
        if (!update) {
          continue;
        }
        messageLog(user, `X (${row.articleid}) "${row.name}" [${i}] ${update}`);
      }

      if (i++ > 4) {
        // break;
      }
    }
  }
}

createConnections().then((connections: Connection[]) => {
  // This scheduler will run for one time to load all data for initial time
  messageLog("", "Database connection success");
  load();
}).catch((error) => {
  messageLog("", "Failed to start server. " + error.message);
  console.log(error)
});
