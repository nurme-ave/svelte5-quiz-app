export async function load({ url }) {
	return {
		category: url.searchParams.get('category')
	};
}
