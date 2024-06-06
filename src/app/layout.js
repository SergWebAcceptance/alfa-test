import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import Preloader from "../components/Preloader";
import { CurrencyProvider } from "@/src/contexts/CurrencyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Alfa Test",
  description: "Alfa Test",
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <body className={inter.className}>
              <Preloader />
              <Header />
              <main>{children}</main>
              <Footer />
            </body>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </html>
  );
}
