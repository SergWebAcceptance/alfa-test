"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";

function Header() {
  const { currentUser, setCurrentUser } = useAuth();
  const { cartQuantity } = useCart();
  const [user, setUser] = useState();

  const [displayQuantity, setDisplayQuantity] = useState(0);

  useEffect(() => {
    setDisplayQuantity(cartQuantity);
  }, [cartQuantity]);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  return (
    <>
      <header className="bg-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex h-16 items-center justify-between">
            <div className="md:flex md:items-center md:gap-12">
              <Link className="block text-teal-600" href="/">
                <Image src="/logo.svg" width={100} height={40} alt="Logo" />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={"/checkout"}
                className="flex items-center gap-1 text-black"
              >
                <ShoppingCart /> ({displayQuantity ? displayQuantity : 0})
              </Link>
              {!user ? (
                <div className="sm:flex sm:gap-4">
                  <Link
                    className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white shadow"
                    href="/sign-in"
                  >
                    Sign In
                  </Link>

                </div>
              ) : (
                <>
                  <div className="flex items-center gap-5">
                    <Link
                      className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white shadow"
                      href="/account"
                    >
                      My Account
                    </Link>
                  </div>
                </>
              )}

              <div className="hidden md:hidden">
                <button className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
