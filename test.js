const config = require('config');

const axios = require('axios').default;

const parser = require ('xml2json');

const vismaGlobalConfig = config.get('vismaGlobal');
const tenant = config.get('tenants')[0];
console.log(tenant);

const body = `<?xml version="1.0" encoding="utf-8" ?>
<Articleinfo>
  <ClientInfo>
    <Clientid>${tenant.clientId}</Clientid>
    <Token>b93b1546-e57d-499c-8320-0d7ff5979552</Token>
  </ClientInfo>
  <Article>
    <articleid>${tenant.articleid}</articleid>
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
  </Article>
</Articleinfo>`

async function test() {
  try {
    console.log(`POST ${vismaGlobalConfig.api}/Article.svc/GetArticle`);
    const result = await axios.post(vismaGlobalConfig.api + "/Article.svc/GetArticle", body, { timeout: 1 * 60 * 1000 });
    console.log(result.data)
    const data = JSON.parse(parser.toJson(result.data));
    console.log(data);
  }
  catch(err) {
    console.log(err.code);
  }
}

test();
