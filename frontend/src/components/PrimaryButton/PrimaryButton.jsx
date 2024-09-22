import React from "react";
import styles from "./PrimaryButton.module.css";

const PrimaryButton = ({ title, onClick, style }) => {
    return (
        <button className={styles.container} style={style} onClick={onClick}>
            {title}
        </button>
    );
};

export default PrimaryButton;
