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

  let preGameState = $state({
    isLoading: false,
    loadingProgress: '',
    countdown: 3
  });

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
      preGameState.isLoading = true;

      const { path, loadingPromise } = await startQuiz(
        $quizStore.selectedCategory,
        $quizStore.selectedDifficulty,
        $quizStore.selectedQuestionCount
      );

      preGameState.loadingProgress = 'Preparing quiz...';
      await loadingPromise;

      preGameState.loadingProgress = 'Get Ready!';

      // Countdown using a controlled timer
      await new Promise((resolve) => {
        let remaining = preGameState.countdown;
        countdownTimer = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            preGameState.countdown = remaining;
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
      preGameState = {
        isLoading: false,
        loadingProgress: '',
        countdown: 3
      };
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

<svelte:head>
  <title>Quiz App - Test Your Knowledge in Movies, Music, Sports & More!</title>
  <meta
    name="description"
    content="Challenge yourself with quizzes in Film, Music, Geography, Sports, History, and Vehicles! Choose your difficulty level, pick 5-15 questions, and test your knowledge. Perfect for both beginners and trivia experts!"
  />
  <meta
    name="keywords"
    content="quiz game, trivia questions, movie quiz, music trivia, geography quiz, sports trivia, history quiz, vehicle knowledge, easy quiz, medium difficulty, hard quiz, multiple choice, educational game, custom quiz length, movie trivia, automotive quiz, world geography, sports knowledge test, historical facts, quick quiz, extended quiz"
  />
</svelte:head>

<!-- Loading overlay -->
{#if preGameState.isLoading || isNavigating}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
    <div class="text-center">
      <div class="mb-6 text-2xl text-white">{preGameState.loadingProgress}</div>

      {#if preGameState.loadingProgress === 'Get Ready!'}
        <div class="animate-bounce text-6xl font-bold text-yellow-300">
          {preGameState.countdown}
        </div>
      {:else}
        <div class="flex items-center justify-center gap-3">
          {#each [0, 0.2, 0.4] as delay, i}
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-yellow-300"
              style="animation-delay: {delay}s"
            ></div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<div class="flex flex-col justify-between text-white opacity-95">
  <div class="flex flex-col gap-2">
    <div class="animate fade-in-from-top delay-1">
      <h1 class="balanced-text pb-3 text-4xl font-semibold uppercase md:text-5xl">
        Welcome to the <span class="text-yellow-300">Quiz&nbsp;</span>App
      </h1>
      <p class="balanced-text md:text-xl">Make your selections below and start the&nbsp;quiz.</p>
      <div class="flex items-center justify-center gap-2 md:text-xl">
        <p>Good luck!</p>
        <i
          class="fas fa-star animate-[bounce_2s_ease-in-out_infinite] text-xl text-yellow-400 transition-transform hover:scale-110"
        ></i>
      </div>
    </div>

    <hr class="animate fade-in-from-top delay-2 mt-7 border border-yellow-400" />

    <div class="mt-7 flex flex-col gap-2">
      <h2 class="animate fade-in-from-top delay-2 font-semibold uppercase">Select a category:</h2>
      <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {#each QUIZ_CATEGORIES as category, i}
          <div class="animate stagger-fade-in {STAGGER_DELAY_CLASSES[i]}">
            <Button
              onclick={() => updateQuizState({ selectedCategory: category.toLowerCase() })}
              selected={$quizStore.selectedCategory === category.toLowerCase()}
              fullWidth
              customClass="transition-colors duration-[600ms] ease-in-out"
              text={category}
            />
          </div>
        {/each}
      </div>

      <div class="animate fade-in-from-top delay-2">
        <div class="mb-6">
          <h2 class="mb-2 font-semibold uppercase">Select difficulty:</h2>
          <div class="space-x-2">
            {#each QUIZ_DIFFICULTIES as difficulty}
              <Button
                onclick={() => updateQuizState({ selectedDifficulty: difficulty.toLowerCase() })}
                selected={$quizStore.selectedDifficulty === difficulty.toLowerCase()}
                customClass="xsm:w-[6.25rem] xsm:px-3 sm:w-28 transition-colors duration-[600ms] ease-in-out"
                text={difficulty}
              />
            {/each}
          </div>
        </div>

        <div>
          <h2 class="mb-2 font-semibold uppercase">Select number of questions:</h2>
          <div class="space-x-2">
            {#each QUIZ_QUESTION_COUNTS as count}
              <Button
                onclick={() => updateQuizState({ selectedQuestionCount: count })}
                selected={$quizStore.selectedQuestionCount === count}
                customClass="w-16 transition-colors duration-[600ms] ease-in-out"
                text={count}
              />
            {/each}
          </div>
        </div>
      </div>

      <Button
        onclick={handleStartQuiz}
        disabled={!$canStartQuiz || preGameState.isLoading}
        variant="primary"
        customClass="w-36 text-lg font-semibold mx-auto fade-in-from-top delay-3 my-7 transition-all duration-700 ease-in-out"
        text="Start Quiz"
      />
    </div>
  </div>
  <div class="mb-2 flex justify-center">
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
</div>
