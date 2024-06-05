"use client";

import React, { useEffect, useState, Suspense } from "react";
import CheckoutForm from "./_components/CheckoutForm";
import { useCart } from "@/src/contexts/CartContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { getProductById } from "../api/products";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY
);

function parsePageParams(paramValue) {
  if (paramValue) {
    const value = parseInt(paramValue);
    if (isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
}

function CheckoutContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, totalAmount, addToCart } = useCart();
  const [cartLength, setCartLength] = useState(0);
  const [utmSource, setUtmSource] = useState("");

  useEffect(() => {
    setCartLength(cart.length);
  }, [cart.length]);

  useEffect(() => {
    const productIdParam = searchParams.get("add-to-cart");
    const utmSourceParam = searchParams.get("utm_source");

    const productId = parsePageParams(productIdParam);
    const utmSourceValue = utmSourceParam;

    if (utmSourceValue) {
      setUtmSource(utmSourceValue);
    }

    if (productId) {
      (async () => {
        const product = await getProductById(productId);
        if (product) {
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: {
              sourceUrl: product.image.sourceUrl,
            },
          });
        }
      })();
    }
  }, []);

  return (
    <>
      {cartLength === 0 ? (
        <section>
          <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:items-center">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="text-3xl font-extrabold sm:text-5xl">
                <strong className="font-bold sm:block">
                  Your cart is empty
                </strong>
              </h1>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-700 sm:w-auto"
                  href="/"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm utmSource={utmSource} />
        </Elements>
      )}
    </>
  );
}

function Checkout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

export default Checkout;
