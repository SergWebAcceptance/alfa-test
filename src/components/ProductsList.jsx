import React, { Suspense } from "react";
import { getProductsByCategory, getProducts } from "../app/api/products";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import Preloader from "./Preloader";

const ProductsList = async () => {
  const products = await getProducts();
  return (
    <>
      <section className="">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <header className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-black bg-clip-text md:text-5xl">
              Shop
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-gray-500"></p>
          </header>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li
                key={product.slug}
                className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div>
                  <div className="group block">
                    <Link
                      className="flex-shrink-0"
                      href={`/products/${product.slug}`}
                      passHref
                    >
                      <img
                        src={product.image.sourceUrl}
                        alt={product.name}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <Link
                      className="flex flex-1 flex-col justify-between bg-white p-4 pb-0"
                      href={`/products/${product.slug}`}
                      passHref
                    >
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>

                      <p className="mt-4 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        <span className="sr-only">Price:</span> €{product.price}
                      </p>
                    </Link>
                    <div className="ustify-between bg-white px-4 pb-4">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

const ProductsListWrapper = () => (
  <Suspense fallback={<Preloader />}>
    <ProductsList />
  </Suspense>
);

export default ProductsListWrapper;
