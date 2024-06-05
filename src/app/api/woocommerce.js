import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Ensure environment variables are being read correctly
const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const consumerKey = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_KEY;
const consumerSecret = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_SECRET;

console.log("URL:", url);
console.log("Consumer Key:", consumerKey);
console.log("Consumer Secret:", consumerSecret);

if (!url || !consumerKey || !consumerSecret) {
  throw new Error("Missing necessary environment variables");
}

// Log the variables to check if they are loaded correctly


// Instantiate the WooCommerce API client
const api = new WooCommerceRestApi({
  url: url,
  consumerKey: consumerKey,
  consumerSecret: consumerSecret,
  version: "wc/v3",
});

export default api;
