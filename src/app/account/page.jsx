'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import LogoutButton from './_components/LogoutButton';
import Orders from './_components/Orders';
import ContactDetailsForm from './_components/ContactDetailsForm';
import { FilePenLine, PackageCheck } from 'lucide-react';

export default function Account() {
  const { currentUser, fetchCurrentUser } = useAuth();

  const [openIndex, setOpenIndex] = useState(1);

  useEffect(() => {
    setOpenIndex(1);
  }, []);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!currentUser) {
    return <p>Please log in.</p>;
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl">Your Account</h1>
      <div className="mt-6">
        <p className="text-lg leading-6 font-medium text-gray-900">
          Welcome, <span className="font-bold">{currentUser.name}</span>!
        </p>

        <div className="md:flex mt-6">
          <ul className="flex-column w-full sm:w-1/4 space-y space-y-4 text-sm font-medium text-gray-500 md:me-4 mb-4 md:mb-0">
            <li>
              <a
                href="#"
                data-id={openIndex}
                aria-current="page"
                className={`inline-flex items-center px-5 py-2.5 gap-2 rounded-lg w-full ${openIndex === 1 ? 'active bg-primary text-white' : 'bg-gray-50 text-gray-700'}`}
                onClick={() => toggleItem(1)}
              >
                <PackageCheck />
                Orders
              </a>
            </li>
            <li>
              <a
                href="#"
                data-id={openIndex}
                className={`inline-flex items-center px-5 py-2.5 gap-2 rounded-lg w-full ${openIndex === 2 ? 'active bg-primary text-white' : 'bg-gray-50 text-gray-700'}`}
                onClick={() => toggleItem(2)}
              >
                <FilePenLine />
                Contact Details
              </a>
            </li>
            <li>
              <LogoutButton />
            </li>
          </ul>
          <div className="sm:w-3/4 p-6 bg-gray-50 text-medium text-gray-500 rounded-lg w-full">
            <div className={openIndex === 1 ? 'block' : 'hidden'}>
              <Orders />
            </div>
            <div className={openIndex === 2 ? 'block' : 'hidden'}>
              <ContactDetailsForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
