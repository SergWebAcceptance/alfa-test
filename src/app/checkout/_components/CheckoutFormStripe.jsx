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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  },
  hidePostalCode: true
};

const getCountryOptionByCode = (code) => {
  const countries = countryList().getData();
  return countries.find((country) => country.value === code);
};

const CheckoutForm = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

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
    if (!selectedPaymentMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }

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

    if (selectedPaymentMethod === "stripe") {
      try {
        const lineItems = cart.map((product) => ({
          product_id: decodeBase64Id(product.id),
          quantity: product.quantity,
        }));

        const orderData = {
          payment_method: selectedPaymentMethod,
          payment_method_title: paymentMethods.find(
            (method) => method.id === selectedPaymentMethod
          ).title,
          set_paid: false,
          status: "pending",
          billing: billingDetails,
          customer_id: currentUser ? decodeBase64Id(currentUser.id) : null,
          line_items: lineItems,
        };

        const order = await createOrder(orderData);
        const orderId = order.id;

        // Fetch the client_secret from the server
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalAmount * 100, // Amount in cents
            currency: "usd",
            billingDetails: billingDetails,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { client_secret } = await response.json();

        const cardElement = elements.getElement(CardElement);
        console.log("Card Element: ", cardElement);
        if (!cardElement) {
          throw new Error("CardElement not found");
        }

        const paymentResult = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${billingDetails.first_name} ${billingDetails.last_name}`,
              email: billingDetails.email,
              address: {
                line1: billingDetails.address_1,
                city: billingDetails.city,
                state: billingDetails.state,
                postal_code: billingDetails.postcode,
                country: billingDetails.country,
              },
            },
          },
        });

        if (paymentResult.error) {
          setErrorMessage(paymentResult.error.message);
        } else {
          if (paymentResult.paymentIntent.status === "succeeded") {
            const transactionId = paymentResult.paymentIntent.id;

            // Fetch charge details
            const chargeResponse = await fetch(`/api/get-charge`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentIntentId: transactionId }),
            });

            if (!chargeResponse.ok) {
              throw new Error("Failed to retrieve charge details");
            }

            const { chargeId } = await chargeResponse.json();

            // Update order status and add transaction ID to the order
            await updateOrderStatus(orderId, "processing");

            await addOrderNote(orderId, `Stripe payment intent created (Payment Intent ID: ${paymentResult.paymentIntent.id}).`);
            await addOrderNote(orderId, `Stripe charge complete (Charge ID: ${chargeId}).`);
          
            await updateOrderMetadata(orderId, {
              _transaction_id: transactionId,
              _stripe_charge_id: chargeId,
            });

            clearCart();
            router.push("/payment-complete");
          }
        }
      } catch (error) {
        setErrorMessage("There was an error processing your order.");
        console.error(error);
      }
    } else {
      if (currentUser) {
        const userId = decodeBase64Id(currentUser.id);
        await createOrderInWooCommerce(billingDetails, userId);
      } else {
        const user = await createUser({
          email: billingDetails.email,
          first_name: billingDetails.first_name,
          last_name: billingDetails.last_name,
          billing: billingDetails,
          shipping: billingDetails,
        });

        await createOrderInWooCommerce(billingDetails, user.id);
      }
    }
  };

  const createOrderInWooCommerce = async (billingDetails, userId) => {
    const lineItems = cart.map((product) => ({
      product_id: decodeBase64Id(product.id),
      quantity: product.quantity,
    }));

    const orderData = {
      payment_method: selectedPaymentMethod,
      payment_method_title: paymentMethods.find(
        (method) => method.id === selectedPaymentMethod
      ).title,
      set_paid: true,
      status: "processing",
      billing: billingDetails,
      customer_id: userId,
      line_items: lineItems,
    };

    try {
      const response = await createOrder(orderData);
      console.log(response);
      clearCart();
      router.push("/payment-complete");
    } catch (error) {
      setErrorMessage("There was an error processing your order.");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:items-center">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6 text-center">
          Checkout
        </h1>

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
                Total: € {totalAmount}
              </h3>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mr-2"
                      required
                    />
                    <label
                      htmlFor={method.id}
                      className="text-sm font-medium text-gray-900 text-left"
                    >
                      {method.title}
                      <div className="payment-box">{method.description}</div>
                    </label>
                  </div>
                ))}
              </div>

              {selectedPaymentMethod === "stripe" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Card Details
                  </label>
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              )}

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
