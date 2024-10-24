<script>
	export let onClick = () => {};
	export let disabled = false;
	export let selected = false;
	export let variant = 'default';
	export let customClass = '';

	$: classList = [
		// Base styles
		'px-5 py-2 m-1 rounded-md transition-colors duration-200 border',

		// Variant and selected state styles
		variant === 'primary'
			? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500'
			: selected
				? 'bg-yellow-300 text-black hover:bg-yellow-300 border-solid border-black'
				: 'bg-white text-black hover:bg-yellow-300 border-solid border-black',

		// Disabled state
		disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',

		// Custom classes
		customClass
	].join(' ');
</script>

<button on:click={onClick} {disabled} class={classList}>
	<slot></slot>
</button>
