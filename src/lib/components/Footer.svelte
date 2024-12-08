<script>
  const currentYear = new Date().getFullYear();
</script>

<div class="mb-3 flex justify-center lg:fixed lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2">
  <footer class="mt-auto pt-7">
    <p class="text-center text-sm text-slate-200">
      &copy; {currentYear} |
      <a
        href="https://www.avenurme.dev"
        target="_blank"
        class="transition-colors duration-700 ease-in-out hover:text-blue-400"
        >Ave Nurme<i class="fa-solid fa-arrow-up-right-from-square fa-xs ml-1"></i></a
      > | Built with SvelteKit
    </p>
  </footer>
</div>
<div class="text-center text-sm text-slate-400 lg:fixed lg:bottom-4 lg:right-4">
  <p
    class="mx-auto flex w-fit flex-wrap items-center justify-center border-t border-slate-400 pt-3 text-center"
  >
    This webpage achieves the{' '}
    <a
      href="https://www.websitecarbon.com/website/svelte5-quiz-app-vercel-app/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="ml-1 whitespace-nowrap text-green-500 underline underline-offset-2">
        carbon rating of A.
      </span>
    </a>
  </p>
  <p class="text-center">
    This is cleaner than <span class="text-green-500">90%</span> of all
    <span class="whitespace-nowrap">web pages globally</span>.
  </p>
  <div class="mb-3 mt-2 flex flex-row justify-center gap-2 text-green-500 lg:mb-0">
    {#each Array(3) as _, i}
      <i class="fa-solid fa-leaf" key={i}></i>
    {/each}
  </div>
</div>
