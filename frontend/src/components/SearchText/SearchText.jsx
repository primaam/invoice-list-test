import React from "react";
import styles from "./SearchText.module.css";

const SearchText = ({ text }) => {
    return <span className={styles.txt}>{text}</span>;
};

export default SearchText;
