import React from "react";
import styles from "./InvoicePage.module.css";
import axios from "axios";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { Modal, InputFieldForm, SearchText, PrimaryButton } from "../../components";
import { FaTrashAlt } from "react-icons/fa";
import { productData } from "../../data/ProductData";
// import { InvoiceList } from "../../data/FakeInvoiceList";
// import { invoiceRevenue } from "../../data/FakeInvoiceRevenue";
import CanvasJSReact from "@canvasjs/react-charts";

import { useSelector, useDispatch } from "react-redux";
import { storeInvoiceAmountList } from "../../redux/reducer/invoiceAmountListRed";
import { storeInvoiceList } from "../../redux/reducer/InvoiceListRed";

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const initialForm = {
    date: "",
    customer: "",
    salesPerson: "",
    notes: "",
};

const InvoicePage = () => {
    const dispatch = useDispatch();
    const invoiceList = useSelector(({ invoiceListReducer }) => invoiceListReducer.data);
    const invoiceAmountList = useSelector(
        ({ invoiceAmountListReducer }) => invoiceAmountListReducer.data
    );

    const [showForm, setShowForm] = React.useState(false);
    const [productAdded, setProductAdded] = React.useState([]);
    const [invoiceForm, setInvoiceForm] = React.useState(initialForm);
    const [errorFormMessage, setErrorFormMessage] = React.useState(initialForm);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);

    const [chartType, setChartType] = React.useState("weekly");

    React.useEffect(() => {
        const fetchInvoicesAmountList = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/invoice/graph");

                dispatch(storeInvoiceAmountList(response.data));
            } catch (error) {
                console.error("Error fetching invoices", error);
            }
        };

        fetchInvoicesAmountList();
    }, []);

    React.useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/invoices?page=${currentPage}&limit=${itemsPerPage}`
                );
                dispatch(storeInvoiceList(response.data));
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("Error fetching invoices", error);
            }
        };

        fetchInvoices();
    }, [currentPage]);

    const groupByWeek = (invoices) => {
        const getWeekNumber = (date) => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        };

        return invoices.reduce((acc, invoice) => {
            const date = new Date(invoice.date.split("-").reverse().join("-"));
            const week = `${date.getFullYear()}-W${getWeekNumber(date)}`;

            if (!acc[week]) {
                acc[week] = 0;
            }
            acc[week] += invoice.totalPrice;
            return acc;
        }, {});
    };

    const groupByMonth = (invoices) => {
        return invoices.reduce((acc, invoice) => {
            const date = new Date(invoice.date.split("-").reverse().join("-"));
            const month = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;

            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += invoice.totalPrice;
            return acc;
        }, {});
    };

    const weeklyDataPoints = React.useMemo(() => {
        const weeklyRevenue = groupByWeek(invoiceAmountList);
        return Object.keys(weeklyRevenue).map((week) => ({
            label: week,
            y: weeklyRevenue[week],
        }));
    }, [invoiceAmountList]);

    const monthlyDataPoints = React.useMemo(() => {
        const monthlyRevenue = groupByMonth(invoiceAmountList);
        return Object.keys(monthlyRevenue).map((month) => ({
            label: month,
            y: monthlyRevenue[month],
        }));
    }, [invoiceAmountList]);

    const options = {
        theme: "light2", // "light1", "dark1", "dark2"
        animationEnabled: true,
        zoomEnabled: true,
        axisX: {
            title: "Date",
        },
        axisY: {
            title: "Total Income",
        },
        title: {
            text: "Revenue",
        },
        data: [
            {
                type: "area",
                dataPoints: chartType === "weekly" ? weeklyDataPoints : monthlyDataPoints,
            },
        ],
    };

    const searchList = React.useMemo(() => {
        const filtered = productData.filter(
            (item) => !productAdded.some((addedItem) => item.id === addedItem.id)
        );
        return filtered;
    }, [productAdded]);

    const totalPrice = React.useMemo(() => {
        if (productAdded.length > 0) {
            const total = productAdded.reduce((acc, product) => {
                return acc + product.price * product.quantity;
            }, 0);
            return total.toLocaleString("id-ID");
        } else {
            return 0;
        }
    }, [productAdded]);

    const handleOpenModal = () => {
        setShowForm(true);
    };

    const handleCloseModal = () => {
        setProductAdded([]);
        setShowForm(false);
        setInvoiceForm(initialForm);
        setErrorFormMessage(initialForm);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setInvoiceForm({ ...invoiceForm, [name]: value });
    };

    const handleOnSelect = (item) => {
        // date, customer, salesPerson, notes, products
        let obj = {
            id: item.id,
            item: item.name,
            quantity: 1,
            price: item.price,
        };

        setProductAdded([...productAdded, obj]);
    };

    const handleIncrement = (id) => {
        setProductAdded((prevProductAdded) => {
            const productExists = prevProductAdded.find((prod) => prod.id === id);

            if (productExists) {
                return prevProductAdded.map((prod) =>
                    prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod
                );
            }
        });
    };

    const handleDecrement = (id) => {
        setProductAdded((prevProductAdded) => {
            const productExists = prevProductAdded.find((prod) => prod.id === id);

            if (productExists && productExists.quantity > 1) {
                return prevProductAdded.map((prod) =>
                    prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod
                );
            } else {
                return prevProductAdded.filter((prod) => prod.id !== id);
            }
        });
    };

    const handleDeleteProduct = (id) => {
        const filtered = productAdded.filter((item) => item.id !== id);

        setProductAdded(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hasError = false;
        let newErrors = { ...errorFormMessage };

        if (productAdded.length === 0) {
            return alert("You have to add the product before submitting!");
        }

        if (invoiceForm.date === "") {
            newErrors.date = "Date is required.";
            hasError = true;
        }
        if (invoiceForm.customer.trim() === "") {
            newErrors.customer = "Customer name is required.";
            hasError = true;
        }
        if (invoiceForm.salesPerson.trim() === "") {
            newErrors.salesPerson = "Sales person is required.";
            hasError = true;
        }

        setErrorFormMessage(newErrors);

        if (!hasError) {
            try {
                const res = await axios.post("http://localhost:5000/api/invoice", {
                    ...invoiceForm,
                    products: productAdded,
                });

                if (res) {
                    const resInvoiceAmount = await axios.get(
                        "http://localhost:5000/api/invoice/graph"
                    );
                    const resInvoiceList = await axios.get(
                        "http://localhost:5000/api/invoice?limit=10&page=1"
                    );

                    dispatch(storeInvoiceAmountList(resInvoiceAmount.data));
                    dispatch(storeInvoiceList(resInvoiceList.data));
                    setErrorFormMessage(initialForm);
                    alert("Invoice Submitted!");
                    handleCloseModal();
                }
            } catch (error) {
                console.error("Error submitting invoice:", error);
                alert("There was an error submitting the invoice. Please try again.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainContainer}>
                <div className={styles.header}>
                    <h1>Invoice List</h1>
                    <button className={styles.addButton} onClick={handleOpenModal}>
                        + Add Invoice
                    </button>
                </div>
                <div>
                    <button onClick={() => setChartType("weekly")}>Weekly</button>
                    <button onClick={() => setChartType("monthly")}>Monthly</button>
                </div>
                <CanvasJSChart options={options} />
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
                {invoiceList ? (
                    <>
                        {invoiceList.data.map((item, i) => {
                            return (
                                <div key={i} className={styles.invoiceContainer}>
                                    <div className={styles.invoiceDetailSection}>
                                        {/* left */}
                                        <div style={{ flex: 0.3 }}>
                                            <div className={styles.invoiceDetailMainSection}>
                                                <p>Invoice No.</p>
                                                <h4>{item.invoiceNo}</h4>
                                            </div>
                                            <div className={styles.invoiceDetailMainSection}>
                                                <p>Date</p>
                                                <h4>{item.date}</h4>
                                            </div>
                                        </div>
                                        {/* mid */}
                                        <div style={{ flex: 0.2 }}>
                                            <div className={styles.invoiceDetailMainSection}>
                                                <p>Customer</p>
                                                <h4>{item.customer}</h4>
                                            </div>
                                            <div className={styles.invoiceDetailMainSection}>
                                                <p>Sales</p>
                                                <h4>{item.salesPerson}</h4>
                                            </div>
                                        </div>
                                        {/* right */}
                                        <div style={{ flex: 0.5 }}>
                                            <h4>Notes</h4>
                                            <p>{item.notes}</p>
                                        </div>
                                    </div>

                                    <div className={styles.invoiceProductListContainer}>
                                        <h3>Products</h3>
                                        {item.products.map((item, i) => {
                                            return (
                                                <div key={i}>
                                                    <div className={styles.invoiceProduct}>
                                                        <h4>{`${i + 1}) ${item.item}`}</h4>
                                                        <h4>
                                                            {item.totalPrice.toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <span>{`Quantity: ${item.quantity}`}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <h3>Total Price: </h3>
                                        <h3>
                                            {item.products.reduce((a, b) => {
                                                const total = a.totalPrice + b.totalPrice;
                                                return total.toLocaleString("id-ID");
                                            })}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <></>
                )}
            </div>

            {/* input form modal */}
            <Modal isOpen={showForm}>
                <div className={styles.formHeaderContainer}>
                    <h3>Add new invoice</h3>
                    <button className={styles.circleButton} onClick={handleCloseModal}>
                        x
                    </button>
                </div>
                <div className={styles.formFieldContainer}>
                    <InputFieldForm
                        type={"date"}
                        required={true}
                        placeholder="date"
                        value={invoiceForm.date}
                        name="date"
                        onChange={handleInputChange}
                        showErrorMessage={errorFormMessage.date.length > 0 ? true : false}
                        errorMessage={errorFormMessage.date}
                    />

                    <InputFieldForm
                        required={true}
                        name={"customer"}
                        onChange={handleInputChange}
                        placeholder={"Customer"}
                        value={invoiceForm.customer}
                        showErrorMessage={errorFormMessage.customer.length > 0 ? true : false}
                        errorMessage={errorFormMessage.customer}
                    />
                    <InputFieldForm
                        required={true}
                        name={"salesPerson"}
                        onChange={handleInputChange}
                        placeholder={"Sales Person"}
                        value={invoiceForm.salesPerson}
                        showErrorMessage={errorFormMessage.salesPerson.length > 0 ? true : false}
                        errorMessage={errorFormMessage.salesPerson}
                    />

                    <textarea
                        onChange={handleInputChange}
                        name="notes"
                        placeholder="Notes"
                        value={invoiceForm.notes}
                    />
                </div>
                <div style={{ width: "100%" }}>
                    <ReactSearchAutocomplete
                        items={searchList}
                        placeholder="Search your product here"
                        showNoResultsText="Sorry, your product is empty"
                        onSelect={handleOnSelect}
                        autoFocus
                        formatResult={(item) => {
                            return (
                                <div className={styles.searchResultContainer}>
                                    <img
                                        className={styles.productImg}
                                        src={`${item.link}${item.id}`}
                                    />
                                    <div className={styles.searchMidContainer}>
                                        <SearchText text={item.name} />
                                        <SearchText text={`Stock: ${item.quantity}`} />
                                    </div>
                                    <SearchText text={item.price.toLocaleString("id-ID")} />
                                </div>
                            );
                        }}
                    />
                </div>
                {productAdded.length > 0 ? (
                    <>
                        {productAdded.map((item, i) => {
                            return (
                                <div key={i} className={styles.formProductContainer}>
                                    <div className={styles.formProductDetail}>
                                        <span>{item.item}</span>
                                        <span>
                                            {(item.price * item.quantity).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <div className={styles.formProductButtonContainer}>
                                        <button onClick={() => handleDeleteProduct(item.id)}>
                                            <FaTrashAlt />
                                        </button>

                                        <button onClick={() => handleDecrement(item.id)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleIncrement(item.id)}>+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <></>
                )}
                <div className={styles.formSectionContainer}>
                    <h3>Total Price:</h3>
                    <h3>{totalPrice}</h3>
                </div>
                <div className={styles.formSectionContainer}>
                    <PrimaryButton
                        onClick={handleCloseModal}
                        style={{
                            backgroundColor: "lightgrey",
                        }}
                        title={"Cancel"}
                    />
                    <PrimaryButton
                        style={{
                            backgroundColor: "lightblue",
                        }}
                        title={"Submit"}
                        onClick={handleSubmit}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default InvoicePage;
