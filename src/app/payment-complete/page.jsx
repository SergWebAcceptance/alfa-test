import React from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function PaymentCompletePage() {
  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 py-36">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <CheckCircle className="text-primary w-16 h-16" />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Payment Complete!
          </h1>
          <p className="mt-2 text-gray-600">
            Your payment has been successfully processed. Thank you for your
            purchase!
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentCompletePage;
