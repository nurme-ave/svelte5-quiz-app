<script>
  let {
    onclick = () => {},
    disabled = false,
    selected = false,
    variant = 'default',
    customClass = '',
    fullWidth = false,
    children
  } = $props();

  let classList = $derived(
    [
      // Conditional base styles
      'px-5 py-4 md:py-3.5 rounded-md border',

      // Width control
      fullWidth ? 'w-full' : 'inline-block',

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
    ].join(' ')
  );
</script>

<!-- 
	In Svelte 4 we used '<slot />' instead of '{@render children?.()}'.
	- 'children' is a slot function that contains the content passed to the Button component
	- '?.()' (optional chaining operator) means "only call this function if it exists" (if there's no content, don't error out)
	- '{@render}' tells Svelte to render the result
-->
<button {onclick} {disabled} class={classList}>
  {@render children?.()}
</button>
