<script>
  // Event handling for parent component communication
  import { createEventDispatcher } from 'svelte';

  // Navigation
  import { goto } from '$app/navigation';

  // Quiz utilities and stores
  import { quizStore, resetQuiz } from '$lib/stores/quizStore';

  // UI Component
  import Button from './Button.svelte';

  // Creates a dispatcher to send events up to parent components, allowing child-to-parent communication
  const dispatch = createEventDispatcher();

  function restartQuiz() {
    resetQuiz(); // Clear all quiz state
    dispatch('restart'); // Notify parent component
    goto('/'); // Navigate to home page
  }
</script>

<div class="animate fade-in-from-top space-y-5 text-center text-white md:w-[32rem]">
  <h1 class="mb-4 text-2xl font-bold md:text-3xl">Congratulations!</h1>
  <div class="space-y-2 md:text-lg">
    <i class="fa-solid fa-trophy fa-3x mb-4 text-yellow-300"></i>
    <p>You've completed the quiz!</p>
    <p>Your score: {$quizStore.score} / {$quizStore.questions.length}</p>
  </div>
  <Button onclick={restartQuiz} variant="primary" customClass="w-44 text-lg font-semibold mx-auto">
    Start New Quiz
  </Button>
</div>
