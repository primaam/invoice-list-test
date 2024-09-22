import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    data: {},
};

const invoiceListSlice = createSlice({
    initialState,
    name: "invoiceList",
    reducers: {
        storeInvoiceList(state, action) {
            state.data = action.payload;
        },
    },
});

export const { storeInvoiceList } = invoiceListSlice.actions;
export default invoiceListSlice.reducer;
