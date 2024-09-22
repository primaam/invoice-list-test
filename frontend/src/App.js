import React from "react";
import { InvoicePage } from "./pages";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
    return (
        <Provider store={store}>
            <InvoicePage />
        </Provider>
    );
}

export default App;
