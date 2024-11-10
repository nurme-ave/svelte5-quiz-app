<script>
  // SvelteKit specific imports
  import { goto } from '$app/navigation'; // For navigation
  import { onMount, onDestroy } from 'svelte'; // Lifecycle hook

  // UI Component
  import Button from '$lib/components/Button.svelte';

  // Quiz-specific constants, utilities and stores
  import {
    QUIZ_CATEGORIES,
    QUIZ_DIFFICULTIES,
    QUIZ_QUESTION_COUNTS,
    STAGGER_DELAY_CLASSES
  } from '$lib/utils/quizConstants';

  import { startQuiz, resetQuiz } from '$lib/utils/quizUtils';

  import { quizStore, updateQuizState, canStartQuiz } from '$lib/stores/quizStore';

  let isLoading = $state(false);
  let loadingProgress = $state('');
  let countdown = $state(3);
  let isNavigating = $state(false);
  let countdownTimer;
  const currentYear = new Date().getFullYear();

  export function load() {
    return {
      meta: {
        title: 'Welcome to Quiz App',
        description:
          'A fun and interactive way to test your knowledge. Choose from multiple categories and challenge yourself!'
      }
    };
  }

  async function handleStartQuiz() {
    if (!$canStartQuiz) {
      alert('Please select a category, difficulty level, and number of questions.');
      return;
    }

    try {
      isLoading = true;

      const { path, loadingPromise } = await startQuiz(
        $quizStore.selectedCategory,
        $quizStore.selectedDifficulty,
        $quizStore.selectedQuestionCount
      );

      loadingProgress = 'Preparing quiz...';
      await loadingPromise;

      loadingProgress = 'Get Ready!';

      // Countdown using a controlled timer
      await new Promise((resolve) => {
        let remaining = countdown;
        countdownTimer = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            countdown = remaining;
          } else {
            clearInterval(countdownTimer);
            resolve();
          }
        }, 1000);
      });

      // Set navigating state before navigation
      isNavigating = true;
      // Small delay to ensure the overlay stays during navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to quiz
      await goto(path);
    } catch (error) {
      alert(error.message);
      isNavigating = false;
    } finally {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      isLoading = false;
      loadingProgress = '';
      countdown = 3;
      // isNavigating stays true during navigation
    }
  }

  onMount(() => {
    resetQuiz();
  });

  onDestroy(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  });
</script>

<!-- Loading overlay -->
{#if isLoading || isNavigating}
  <div class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
    <div class="text-center">
      <div class="text-2xl text-white mb-6">{loadingProgress}</div>

      {#if loadingProgress === 'Get Ready!'}
        <div class="text-6xl font-bold text-yellow-300 animate-bounce">
          {countdown}
        </div>
      {:else}
        <div class="flex items-center justify-center gap-3">
          {#each [0, 0.2, 0.4] as delay, i}
            <div
              class="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
              style="animation-delay: {delay}s"
            ></div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<div class="flex justify-between flex-col text-white opacity-95">
  <div class="flex flex-col gap-2">
    <div class="animate fade-in-from-top delay-1">
      <h1 class="text-4xl md:text-5xl font-semibold pb-3 uppercase balanced-text">
        Welcome to the <span class="text-yellow-300">Quiz&nbsp;</span>App
      </h1>
      <p class="md:text-xl balanced-text">Make your selections below and start the&nbsp;quiz.</p>
      <div class="md:text-xl flex gap-2 items-center justify-center">
        <p>Good luck!</p>
        <i
          class="fas fa-star text-xl text-yellow-400 transition-transform hover:scale-110 animate-[bounce_2s_ease-in-out_infinite]"
        ></i>
      </div>
    </div>

    <hr class="mt-7 border border-yellow-400 animate fade-in-from-top delay-2" />

    <div class="flex flex-col gap-2 mt-7">
      <h2 class="font-semibold uppercase animate fade-in-from-top delay-2">Select a category:</h2>
      <div class="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {#each QUIZ_CATEGORIES as category, i}
          <div class="animate stagger-fade-in {STAGGER_DELAY_CLASSES[i]}">
            <Button
              onclick={() => updateQuizState({ selectedCategory: category.toLowerCase() })}
              selected={$quizStore.selectedCategory === category.toLowerCase()}
              fullWidth
              customClass="transition-colors duration-[600ms] ease-in-out"
            >
              {category}
            </Button>
          </div>
        {/each}
      </div>

      <div class="animate fade-in-from-top delay-2">
        <div class="mb-6">
          <h2 class="font-semibold uppercase mb-2">Select difficulty:</h2>
          <div class="space-x-2">
            {#each QUIZ_DIFFICULTIES as difficulty}
              <Button
                onclick={() => updateQuizState({ selectedDifficulty: difficulty.toLowerCase() })}
                selected={$quizStore.selectedDifficulty === difficulty.toLowerCase()}
                customClass="xsm:w-[6.25rem] xsm:px-3 sm:w-28 transition-colors duration-[600ms] ease-in-out"
              >
                {difficulty}
              </Button>
            {/each}
          </div>
        </div>

        <div>
          <h2 class="font-semibold uppercase mb-2">Select number of questions:</h2>
          <div class="space-x-2">
            {#each QUIZ_QUESTION_COUNTS as count}
              <Button
                onclick={() => updateQuizState({ selectedQuestionCount: count })}
                selected={$quizStore.selectedQuestionCount === count}
                customClass="w-16 transition-colors duration-[600ms] ease-in-out"
              >
                {count}
              </Button>
            {/each}
          </div>
        </div>
      </div>

      <Button
        onclick={handleStartQuiz}
        disabled={!$canStartQuiz || isLoading}
        variant="primary"
        customClass="w-36 text-lg font-semibold mx-auto fade-in-from-top delay-3 my-7 transition-all duration-700 ease-in-out"
      >
        Start Quiz
      </Button>
    </div>
  </div>
  <div class="flex justify-center mb-2">
    <footer class="mt-auto pt-7">
      <p class="text-white text-sm text-center">
        &copy; {currentYear} |
        <a
          href="https://www.avenurme.dev"
          target="_blank"
          class="underline underline-offset-4 decoration-blue-400 transition-colors duration-700 ease-in-out hover:text-blue-400"
          >Ave Nurme</a
        > | Built with SvelteKit
      </p>
    </footer>
  </div>
</div>
