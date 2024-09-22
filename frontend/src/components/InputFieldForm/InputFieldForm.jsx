import React from "react";
import styles from "./InputFieldForm.module.css";

const InputFieldForm = ({
    value,
    onChange,
    name,
    type,
    placeholder,
    required,
    errorMessage,
    showErrorMessage,
}) => {
    return (
        <div className={styles.container}>
            {type === "date" ? (
                <input
                    className={styles.input}
                    value={value}
                    name={name}
                    onChange={onChange}
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    min={new Date().toISOString().split("T")[0]}
                />
            ) : (
                <input
                    className={styles.input}
                    value={value}
                    name={name}
                    onChange={onChange}
                    type={type}
                    required={required}
                    placeholder={placeholder}
                />
            )}
            {showErrorMessage === true && <span style={{ color: "red" }}>{errorMessage}</span>}
        </div>
    );
};

export default InputFieldForm;
