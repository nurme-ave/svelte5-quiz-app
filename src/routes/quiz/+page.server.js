// Retrieve the 'category' query parameter from the URL
export async function load({ url }) {
  return {
    category: url.searchParams.get('category')
  };
}
