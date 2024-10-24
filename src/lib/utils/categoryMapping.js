export const categoryMapping = {
	film: 11,
	music: 12,
	sports: 21,
	history: 23,
	vehicles: 28,
	geography: 22
};

// Reverse mapping
export const categoryIdToName = Object.fromEntries(
	Object.entries(categoryMapping).map(([name, id]) => [id, name])
);
