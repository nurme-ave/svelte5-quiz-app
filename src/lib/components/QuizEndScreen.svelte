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

<div class="text-white text-center md:w-[32rem] space-y-5 animate fade-in-from-top">
  <h1 class="text-2xl md:text-3xl font-bold mb-4">Congratulations!</h1>
  <div class="md:text-lg space-y-2">
    <i class="fa-solid fa-trophy fa-3x text-yellow-300 mb-4"></i>
    <p>You've completed the quiz!</p>
    <p>Your score: {$quizStore.score} / {$quizStore.questions.length}</p>
  </div>
  <Button onclick={restartQuiz} variant="primary" customClass="w-44 text-lg font-semibold mx-auto">
    Start New Quiz
  </Button>
</div>
