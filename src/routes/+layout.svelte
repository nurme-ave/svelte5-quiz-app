<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { quizCategory, getQuizBackgroundImage } from '$lib/stores/quizStore';
	import { preloadImage, getBackgroundImageMap } from '$lib/utils/imagePreloader';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isLoading = $state(true);
	let currentImage = $state('');
	let nextImage = $state('');

	const LANDING_BG = '/images/bkg_main.jpg';
	const backgroundImageMap = getBackgroundImageMap();

	onMount(async () => {
		const imagePromises = Object.values(backgroundImageMap).map(preloadImage);
		await Promise.all([preloadImage(LANDING_BG), ...imagePromises]);
		isLoading = false;
	});

	$effect(() => {
		const newImage = $page.url.pathname.startsWith('/quiz')
			? getQuizBackgroundImage($quizCategory)
			: LANDING_BG;

		if (newImage !== currentImage) {
			nextImage = newImage;
			setTimeout(() => {
				currentImage = newImage;
			}, 50);
		}
	});
</script>

<svelte:head>
	{#if nextImage}
		<link rel="preload" as="image" href={nextImage} />
	{/if}
</svelte:head>

<div class="background-container" class:is-loading={isLoading}>
	{#if currentImage}
		<div
			class="background transition-opacity duration-500"
			style="background-image: url({currentImage});"
			class:opacity-100={currentImage === nextImage}
			class:opacity-0={currentImage !== nextImage}
		>
			<main
				class="flex flex-col justify-start text-center gap-3 p-7 sm:p-14 md:p-16 lg:p-20 min-h-screen max-w-5xl mx-auto"
			>
				{@render children?.()}
			</main>
		</div>
	{/if}

	{#if nextImage && nextImage !== currentImage}
		<div
			class="background transition-opacity duration-500 absolute inset-0"
			style="background-image: url({nextImage});"
			class:opacity-100={currentImage !== nextImage}
			class:opacity-0={currentImage === nextImage}
		>
			<main
				class="flex flex-col justify-start text-center gap-3 p-7 sm:p-14 md:p-16 lg:p-20 min-h-screen max-w-5xl mx-auto"
			>
				{@render children?.()}
			</main>
		</div>
	{/if}
</div>

<style>
	.background-container {
		position: relative;
		min-height: 100vh;
		background-color: #000;
	}
	
	.background {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		background-attachment: fixed;
		min-height: 100vh;
	}

	.background::before {
		content: '';
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.65);
		z-index: 1;
	}

	.background > * {
		position: relative;
		z-index: 2;
	}
</style>
