import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    data: [],
};

const invoiceAmountListSlice = createSlice({
    initialState,
    name: "invoiceList",
    reducers: {
        storeInvoiceAmountList(state, action) {
            state.data = action.payload;
        },
    },
});

export const { storeInvoiceAmountList } = invoiceAmountListSlice.actions;
export default invoiceAmountListSlice.reducer;
