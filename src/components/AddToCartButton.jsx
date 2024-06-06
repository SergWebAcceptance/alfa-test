"use client";
import React from "react";
import { useCart } from "@/src/contexts/CartContext";
import { Check, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

function AddToCartButton({ product }) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const existingIndex = cart.findIndex((item) => item.id === product.id);
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1, // You can adjust this as needed
    });
    router.push('/checkout');
  };
  return (
    <>
      {existingIndex > -1 ? (
        <button disabled className="flex gap-2 items-center rounded-md bg-primary hover:bg-primary px-8 mt-5 py-3 text-sm font-medium text-white shadow">
          <Check/> Already in cart 
        </button>
      ) : (
        <button
          className="flex gap-2 items-center rounded-md bg-primary hover:bg-primary px-8 mt-5 py-3 text-sm font-medium text-white shadow"
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart/>
          Add to cart
        </button>
      )}
    </>
  );
}

export default AddToCartButton;
