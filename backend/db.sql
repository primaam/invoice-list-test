CREATE TABLE invoice (
    invoiceNo SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    customer VARCHAR(255) NOT NULL,
    salesPerson VARCHAR(255) NOT NULL,
    notes TEXT
);
CREATE TABLE productSold (
    id SERIAL PRIMARY KEY,
    invoiceNo INT REFERENCES invoice(invoiceNo) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    totalPrice NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * price) STORED
);