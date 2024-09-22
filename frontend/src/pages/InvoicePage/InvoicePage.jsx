import React from "react";
import styles from "./InvoicePage.module.css";
import { productData } from "../../data/ProductData";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { Modal, InputFieldForm, SearchText, PrimaryButton } from "../../components";
import { FaTrashAlt } from "react-icons/fa";
import { InvoiceList } from "../../data/FakeInvoiceList";

const initialForm = {
    date: "",
    customer: "",
    salesPerson: "",
    notes: "",
};
const InvoicePage = () => {
    const [showForm, setShowForm] = React.useState(false);
    const [productAdded, setProductAdded] = React.useState([]);
    const [invoiceForm, setInvoiceForm] = React.useState(initialForm);
    const [errorFormMessage, setErrorFormMessage] = React.useState(initialForm);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        let hasError = false;
        let newErrors = { ...errorFormMessage };

        if (productAdded.length === 0)
            return alert("You have to add the product before submitted!");

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
            console.log("Form submitted:", invoiceForm);
            setErrorFormMessage(initialForm);
            alert("Invoice Submitted!");
            handleCloseModal();
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
                {InvoiceList.map((item, i) => {
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
                                                <h4>{item.totalPrice.toLocaleString("id-ID")}</h4>
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
