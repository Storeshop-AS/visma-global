import * as bodyParser from "body-parser";
import { Router, Request, Response } from "express";
import { discountsController as DiscountsController } from "./discounts/discounts.controller";

const router: Router = Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use("/discounts", DiscountsController);

router.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!!");
});

export const ApiController: Router = router;
