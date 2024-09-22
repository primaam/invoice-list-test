import { createInvoice, getInvoices, getInvoiceAmount } from "../controllers/invoice";
const express = require("express");

const router = express.Router();

router.post("/invoice", createInvoice);
router.get("/invoice", getInvoices);
router.get("/invoice/graph", getInvoiceAmount);

export { router };
