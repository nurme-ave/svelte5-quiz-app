<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores'; // Contains information about the current page request
  import { getQuizBackgroundImage } from '$lib/utils/quizUtils';
  import { quizStore } from '$lib/stores/quizStore';
  import { preloadImage } from '$lib/utils/imagePreloader';
  import { defaultMeta } from '$lib/meta';

  let { children, data } = $props();
  let isInitialLoading = $state(true);
  let backgroundLoaded = $state(false);

  const LANDING_BG = '/images/bkg_winter.jpg';

  // Combine default metadata with page-specific metadata, falling back to defaults if none provided
  const meta = $derived({
    ...defaultMeta,
    ...(data?.meta || {})
  });

  let backgroundImage = $derived(
    $page.url.pathname.startsWith('/quiz')
      ? getQuizBackgroundImage($quizStore.selectedCategory)
      : LANDING_BG
  );

  onMount(async () => {
    try {
      // Preload the landing background
      await preloadImage(LANDING_BG);
      backgroundLoaded = true;
    } finally {
      // Even if image fails to load, we should show content
      isInitialLoading = false;
    }
  });
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  {#if backgroundImage}
    <link rel="preload" as="image" href={backgroundImage} />
  {/if}
</svelte:head>

{#if isInitialLoading}
  <div class="fixed inset-0 flex items-center justify-center bg-black">
    <div class="text-center">
      <div class="flex items-center justify-center gap-3">
        {#each [0, 0.2, 0.4] as delay}
          <div
            class="h-2 w-2 animate-bounce rounded-full bg-yellow-300"
            style="animation-delay: {delay}s"
          ></div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<div
  class="background transition-opacity duration-500"
  class:opacity-0={!backgroundLoaded}
  style="background-image: url({backgroundImage});"
>
  <main
    class="2xl:pt-18 mx-auto flex min-h-dvh flex-col justify-start gap-3 px-7 pb-0 pt-10 text-center md:max-w-3xl lg:max-w-5xl lg:pt-14 3xl:pt-24"
  >
    {@render children?.()}
  </main>
</div>

<!-- 
	In Svelte 4 we used '<slot />' instead of '{@render children?.()}'.
	- 'children' is a slot function that contains the content passed to the Button component
	- '?.()' (optional chaining operator) means "only call this function if it exists" (if there's no content, don't error out)
	- '{@render}' tells Svelte to render the result
-->
