const express = require("express");
const { createInvoice, getInvoices, getInvoiceAmount } = require("../controllers/invoice");

const router = express.Router();

router.post("/invoice", createInvoice);
router.get("/invoice", getInvoices);
router.get("/invoice/graph", getInvoiceAmount);

module.exports = router;
