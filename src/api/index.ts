import * as bodyParser from "body-parser";
import { Router, Request, Response } from "express";
import { discountController as DiscountController } from "./discount/discount.controller";
import { orderController as OrderController } from "./order/order.controller";

const router: Router = Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use("/discount", DiscountController);
router.use("/order", OrderController);

router.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!!");
});

export const ApiController: Router = router;
