import React from "react";
import Link from "next/link";
import Image from "next/image";

function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-center text-teal-600">
          <Link className="block text-teal-600" href="/">
            <Image src="/logo.svg" width={100} height={40} alt="Logo" />
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Incidunt
          consequuntur amet culpa cum itaque neque.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
