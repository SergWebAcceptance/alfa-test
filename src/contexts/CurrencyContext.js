"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  return useContext(CurrencyContext);
};

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState("€");

  useEffect(() => {
    async function fetchCurrencies() {
      const res = await fetch(
        "https://alfa.testapp.fun/wp-json/custom/v1/currencies"
      );
      const data = await res.json();
      console.log(data);
      setCurrencies(data.currencies);
      setRates(data.rates);
    }

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const currencySymbols = {
      EUR: "€",
      USD: "$",
      GBP: "£",
      // add more currencies as needed
    };

    setSelectedCurrencySymbol(currencySymbols[selectedCurrency] || "");
  }, [selectedCurrency]);

  const value = {
    currencies,
    rates,
    selectedCurrency,
    setSelectedCurrency,
    selectedCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
