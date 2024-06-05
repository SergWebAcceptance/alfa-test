import axiosClient from "./GlobalApi";

const GET_PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 9999) {
      nodes {
        slug
        name
        description
        ... on SimpleProduct {
            id
            price(format: RAW)
          productCategories {
            nodes {
              name
            }
          }
        }
        image {
          sourceUrl
        }
      }
    }
  }
`;

const GET_PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      slug
      name
      description
      ... on SimpleProduct {
        price(format: RAW)
        productCategories {
          nodes {
            name
          }
        }
      }
      image {
        sourceUrl
      }
    }
  }
`;

const GET_PRODUCT_BY_ID_QUERY = `
  query GetProductById($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      id
      name
      slug
      ... on SimpleProduct {
        id
        price(format: RAW)
        productCategories {
          nodes {
            name
          }
        }
        image {
            sourceUrl
          }
      }
      
    }
  }
`;

export const getProducts = async () => {
  const response = await axiosClient.post("", {
    query: GET_PRODUCTS_QUERY,
  });
  console.log(response.data);
  return response.data.data.products.nodes;
};

export const getProductById = async (id) => {
  const response = await axiosClient.post("", {
    query: GET_PRODUCT_BY_ID_QUERY,
    variables: { id },
  });
  //console.log(response.data.data.product);

  return response.data.data.product;
};

export const getProductsByCategory = async (category) => {
  const products = await getProducts();
  const categoryProducts = products.filter((product) =>
    product.categories.nodes.some((cat) => cat.name === category)
  );
  return categoryProducts;
};

export const getProduct = async (slug) => {
  const response = await axiosClient.post("", {
    query: GET_PRODUCT_BY_SLUG_QUERY,
    variables: { slug },
  });

  return response.data.data.product;
};
