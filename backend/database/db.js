const { Pool } = require("pg");

const pool = new Pool({
    user: "admin",
    host: "localhost",
    database: "invoice_db",
    password: "admin",
    port: 5432,
});

module.exports = pool;
