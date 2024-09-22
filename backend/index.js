import { router as invoiceRoutes } from "./routes";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./database/db");

const app = express();
const port = 3000;

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use("/api", invoiceRoutes);

module.exports = { app };
