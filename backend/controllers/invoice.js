const pool = require("../database/db");

const createInvoice = async (req, res) => {
    const { date, customer, salesPerson, notes, products } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const invoiceResult = await client.query(
            "INSERT INTO invoice (date, customer, salesPerson, notes) VALUES ($1, $2, $3, $4) RETURNING *",
            [date, customer, salesPerson, notes]
        );
        const invoiceNo = invoiceResult.rows[0].invoiceno;

        for (const product of products) {
            const { item, quantity, price } = product;
            await client.query(
                "INSERT INTO productSold (invoiceNo, item, quantity, price) VALUES ($1, $2, $3, $4)",
                [invoiceNo, item, quantity, price]
            );
        }

        await client.query("COMMIT");
        res.status(201).json({
            message: "success",
            invoiceNo,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({
            error: "Transaction Failed",
        });
    } finally {
        client.release();
    }
};

const getInvoices = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (page < 1 || limit <= 0) {
        return res.status(400).json({ message: "Invalid page or limit value" });
    }

    try {
        const countResult = await pool.query("SELECT COUNT(*) FROM invoice");
        const totalItems = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);

        const result = await pool.query(
            `
            SELECT 
                i.invoiceNo, 
                i.date,
                i.customer, 
                i.salesPerson, 
                i.notes, 
                ARRAY_AGG(
                    JSON_BUILD_OBJECT(
                            'item', p.item, 
                            'quantity', p.quantity, 
                            'price', p.price, 
                            'totalPrice', p.totalPrice
                        )
                ) AS products
            FROM 
                invoice i
            LEFT JOIN 
                productSold p ON i.invoiceNo = p.invoiceNo
            GROUP BY 
                i.invoiceNo, i.date
            ORDER BY 
                i.date DESC
            LIMIT $1 OFFSET $2;`,
            [limit, offset]
        );

        res.status(200).json({
            current: page,
            totalItems: totalItems,
            totalPages: totalPages,
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching data",
            error: error.message,
        });
    }
};

const getInvoiceAmount = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                i.invoiceNo, 
                i.date,
                i.customer, 
                i.salesPerson, 
                p.totalPrice 
            FROM 
                invoice i
            LEFT JOIN 
                productSold p ON i.invoiceNo = p.invoiceNo
            GROUP BY 
                i.invoiceNo, i.date
            ORDER BY 
                i.date DESC`
        );

        res.status(200).json({
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching data",
            error: error.message,
        });
    }
};

export { createInvoice, getInvoices, getInvoiceAmount };
