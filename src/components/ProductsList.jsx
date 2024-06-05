import React from "react";
import { getProductsByCategory, getProducts } from "../app/api/products";
import Link from "next/link";

export default async function ProductsList() {
  // const products = await getProductsByCategory("House");
  const products = await getProducts();
  return (
    <>
      <section className="">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <header className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-black bg-clip-text md:text-5xl">
              Shop
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-gray-500">
              
            </p>
          </header>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li
                key={product.slug}
                className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="group block">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image.sourceUrl}
                        alt={product.name}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between bg-white p-4">
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>

                      <p className="mt-4 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        <span className="sr-only">Price:</span> € 
                        {product.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
