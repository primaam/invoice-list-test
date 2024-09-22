import { configureStore } from "@reduxjs/toolkit";
import invoiceListReducer from "./reducer/InvoiceListRed";
import invoiceAmountListReducer from "./reducer/invoiceAmountListRed";

const store = configureStore({
    reducer: {
        invoiceListReducer,
        invoiceAmountListReducer,
    },
});

export default store;
