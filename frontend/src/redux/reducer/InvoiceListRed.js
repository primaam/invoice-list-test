import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    current: 1,
    totalItems: 0,
    totalPages: 0,
    data: [],
};

const invoiceListSlice = createSlice({
    initialState,
    name: "invoiceList",
    reducers: {
        storeInvoiceList(state, action) {
            state.current = action.payload.current;
            state.totalItems = action.payload.totalItems;
            state.totalPages = action.payload.totalPages;
            state.data = action.payload.data;
        },
    },
});

export const { storeInvoiceList } = invoiceListSlice.actions;
export default invoiceListSlice.reducer;
