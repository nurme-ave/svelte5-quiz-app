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

  const LANDING_BG = '/images/bkg_main.jpg';

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
  <div class="fixed inset-0 bg-black flex items-center justify-center">
    <div class="text-center">
      <div class="flex items-center justify-center gap-3">
        {#each [0, 0.2, 0.4] as delay}
          <div
            class="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
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
    class="flex flex-col justify-start text-center gap-3 pt-10 pb-0 px-7 lg:pt-14 2xl:pt-18 3xl:pt-24 md:max-w-3xl lg:max-w-5xl mx-auto"
  >
    {@render children?.()}
  </main>
</div>
