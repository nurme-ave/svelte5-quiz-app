<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { quizCategory, getQuizBackgroundImage } from '$lib/stores/quizCategoryStore';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();

	const LANDING_BG = '/images/bkg_main.jpg';

	let backgroundImage = $derived(
		$page.url.pathname.startsWith('/quiz') ? getQuizBackgroundImage($quizCategory) : LANDING_BG
	);
</script>

<svelte:head>
	{#if backgroundImage}
		<link rel="preload" as="image" href={backgroundImage} />
	{/if}
</svelte:head>

<div class="background" style="background-image: url({backgroundImage});">
	<main
		class="flex flex-col justify-center items-center gap-3 p-10 md:p-20 min-h-screen max-w-5xl mx-auto"
	>
		{@render children?.()}
	</main>
</div>
