const axios = require('axios').default;

const json = true

function saveArticle(body: any, path: string, headers: any) {
  const url = `${path}/product`;
  return axios.post(url, body, { headers });
}
function saveCustomer(body: any, path: string, headers: any) {
  const url = `${path}/customer`;
  return axios.post(url, body, { headers });
}

export { saveArticle, saveCustomer };
