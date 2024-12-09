import { Request, Response, Router } from 'express';
import moment from 'moment';

import * as fs from 'fs';

const axios = require('axios').default;

const router: Router = Router({mergeParams: true});

class OrderController {
    async getFormattedOrderReqBody(orderBody: any) {
      const {
        model,
        customerId,
        customerName,
        clientId,
        accessToken,
        orderlines,
        orderNumber
      } = orderBody;
    
      let orderLinesXml = ``;
      orderlines.forEach((line: any) => {
        orderLinesXml = orderLinesXml + `
        <Orderline>
          <articleno>${line.no}</articleno>
          <quantity>${line.quantity}</quantity>
          <price>${line.price}</price>
        </Orderline>`;
      });
    
      return `<?xml version="1.0" encoding="UTF-8"?>
      <Order>
        <ClientInfo>
          <Clientid>${clientId}</Clientid>
          <Token>${accessToken}</Token>
        </ClientInfo>
       <Orderhead>
         <orderno></orderno>
         <customerId>${customerId}</customerId>
         <name>${customerName}</name>
         <street>${model && model.addressline1 ? model.addressline1 : ''}</street>
         <street2>${model && model.addressline2 ? model.addressline2 : ''}</street2>
         <postnumber>${model && model.postalcode ? model.postalcode : ''}</postnumber>
         <postplace>${model && model.postaladdress ? model.postaladdress : ''}</postplace>
         <NameContactNoInvoice>${model && model.receiver ? model.receiver : ''}</NameContactNoInvoice>
         <orderStatus>10050</orderStatus>
         <invoiceNo>${orderNumber}</invoiceNo>
       </Orderhead>
       <Orderlines>
        ${orderLinesXml}
       </Orderlines>
      </Order>`;
    }

    async post(req: Request, res: Response) {
        try {
            const date = moment().format('DD.MM.YYYY HH:mm:ss');
            const reqBody = req.body;
            const url = `${reqBody.orderBody.api}/Order.svc/PostOrder`;
            const orderBody = await this.getFormattedOrderReqBody(reqBody.orderBody);

            const filename = `./data/${date}-order-request.xml`;
            fs.writeFileSync(filename, orderBody);

            const config = {
                headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}
            };
            axios.defaults.timeout = 380000; // Set default timeout to 5 seconds
            const result = axios.post(url, orderBody, config);

            let message = '';
            let localId = 0;
            let errorCode = 0;
            if (result && result.status == 200) {
                if (result.body) {
                    const errorCodeMatches = result.body.match(/<ErrorCode.*?>(.*?)<\/ErrorCode>/);
                    errorCode = errorCodeMatches[1];
                    const messageMatches = result.body.match(/<Message.*?>(.*?)<\/Message>/);
                    message = messageMatches[1];
                    if (errorCode == 0) {
                        const orderNoMatches = result.body.match(/<orderNo.*?>(.*?)<\/orderNo>/);
                        localId = orderNoMatches[1];
                    }
                }
            }

            return res.status(500).json({
                error: false,
                time: new Date(),
                status: result.status,
                message,
                defaultMessage: message,
                errorCode,
                localId,
                xmlResponse: result
            });
        }
        catch (e: any) {
            return res.status(500).json({
                error: false,
                time: new Date(),
                status: 500,
                message: e?.message || 'Order failed to create!',
                defaultMessage: e?.message || 'Order failed to create!',
                errorCode: '',
                localId: 0,
                xmlResponse: []
            });            
        }
    }
}

const controller = new OrderController();

router.post('/', controller.post);

export const orderController: Router = router;
