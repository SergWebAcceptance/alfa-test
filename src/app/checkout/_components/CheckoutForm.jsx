"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/src/contexts/CartContext";
import {
  createOrder,
  updateOrderStatus,
  updateOrderMetadata,
} from "../../api/orders";
import { createUser } from "../../api/users";
import { useAuth } from "@/src/contexts/AuthContext";
import { getPaymentMethods } from "../../api/checkout";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import countryList from "react-select-country-list";
import { decodeBase64Id } from "@/src/utils/decodeBase64Id";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { encrypt, decrypt } from "@/src/utils/encrypt-decrypt";
import { useCurrency } from "@/src/contexts/CurrencyContext";
import CurrencySwitcher from "@/src/components/CurrencySwitcher";
import Cart from "@/src/components/Cart";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

const getCountryOptionByCode = (code) => {
  const countries = countryList().getData();
  return countries.find((country) => country.value === code);
};

const CheckoutForm = ({ utmSource }) => {
  const { cart, totalAmount, clearCart } = useCart();
  const { currentUser, setCurrentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { selectedCurrency, rates, selectedCurrencySymbol } = useCurrency();

  useEffect(() => {
    async function fetchCheckoutData() {
      const paymentMethods = await getPaymentMethods();
      setPaymentMethods(paymentMethods);
    }

    fetchCheckoutData();
  }, []);

  const initialValues = {
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    address: currentUser?.billing.address1 || "",
    city: currentUser?.billing.city || "",
    state: currentUser?.billing.state || "",
    postalCode: currentUser?.billing.postcode || "",
    country: getCountryOptionByCode(currentUser?.billing.country) || {
      value: "US",
      label: "United States",
    },
    email: currentUser?.email || "",
    phone: currentUser?.billing.phone || "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postalCode: Yup.string().required("Postal Code is required"),
    country: Yup.object().required("Country is required").nullable(),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string().required("Phone is required"),
  });

  const handleSubmit = async (values) => {
    const billingDetails = {
      first_name: values.firstName,
      last_name: values.lastName,
      address_1: values.address,
      city: values.city,
      state: values.state,
      postcode: values.postalCode,
      country: values.country.value,
      email: values.email,
      phone: values.phone,
    };

    try {
      let userId = currentUser ? decodeBase64Id(currentUser.id) : null;

      // If user is not logged in, create a new user and log them in
      if (!userId) {
        const newUser = await createUser({
          email: billingDetails.email,
          first_name: billingDetails.first_name,
          last_name: billingDetails.last_name,
          billing: billingDetails,
          shipping: billingDetails,
          password: "Test123", // Use a default password for new users
        });

        // Login the new user
        const loginResponse = await fetch(`/api/sign-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: billingDetails.email,
            password: "Test123", // Use the same password for login
          }),
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(loginData.message || "Login failed");
        }

        if (loginData.jwt) {
          localStorage.setItem("jwt", loginData.jwt);
          const user = encrypt(JSON.stringify(loginData.user));
          localStorage.setItem("user", user);
          localStorage.setItem('refreshToken', loginData.refreshToken);
          setCurrentUser(loginData.user);
          userId = decodeBase64Id(loginData.user.id);
        } else {
          throw new Error("JWT not found");
        }
      }

      const lineItems = cart.map((product) => ({
        product_id: decodeBase64Id(product.id),
        quantity: product.quantity,
      }));

      const orderData = {
        set_paid: false,
        status: 'pending', // Ensure the order is in 'pending' status
        billing: billingDetails,
        customer_id: userId,
        line_items: lineItems,
        currency: selectedCurrency,
        meta_data: [
          {
            key: 'utm_source',
            value: utmSource,
          },
        ],
      };

      const order = await createOrder(orderData);
      const orderId = order.id;
      const orderKey = order.order_key;

      // Generate one-time login link
      const response = await fetch('https://alfa.testapp.fun/wp-json/custom/v1/generate-login-link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included in the request
        body: JSON.stringify({
          email: billingDetails.email,
          order_id: orderId,
          order_key: orderKey,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        clearCart();
        window.location.href = data.login_link;
      } else {
        setErrorMessage(data.error || 'There was an error processing your order.');
      }
    } catch (error) {
      setErrorMessage('There was an error processing your order.');
      console.error(error);
    }
  };

  const totalInSelectedCurrency = totalAmount * (rates[selectedCurrency] || 1);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:items-center">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6 text-center">
          Checkout
        </h1>

        <CurrencySwitcher />

        <Cart />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="space-y-6">
              {/* Fields for billing details */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <Field
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <Field
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <Field
                  type="text"
                  id="address"
                  name="address"
                  className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <ErrorMessage
                  name="address"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <Field
                    type="text"
                    id="city"
                    name="city"
                    className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <Field
                    type="text"
                    id="state"
                    name="state"
                    className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Postal Code
                  </label>
                  <Field
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage
                    name="postalCode"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <Field name="country">
                  {({ field }) => (
                    <Select
                      {...field}
                      options={countryList().getData()}
                      className="mt-1"
                      onChange={(option) => setFieldValue("country", option)}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="country"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <Field
                  type="text"
                  id="phone"
                  name="phone"
                  className="py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-6 text-center">
                Total: {selectedCurrencySymbol} {totalInSelectedCurrency.toFixed(2)}
              </h3>

              <button
                className="block w-full mt-4 rounded bg-primary px-5 py-3 text-sm text-gray-100 transition hover:bg-blue-700"
                type="submit"
              >
                Submit
              </button>
              {errorMessage && (
                <div className="error text-sm font-medium mt-2 text-red-600">
                  {errorMessage}
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CheckoutForm;
