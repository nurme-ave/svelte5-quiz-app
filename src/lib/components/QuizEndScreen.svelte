<script>
  // Quiz utilities and stores
  import { quizStore } from '$lib/stores/quizStore';
  import { playSoundEffect } from '$lib/utils/soundUtils';
  import { onMount } from 'svelte';

  // UI Component
  import Button from './Button.svelte';

  // Props
  const { onrestart = () => {} } = $props(); // Callback prop instead of event dispatch

  // Play sound effect
  onMount(async () => {
    try {
      await playSoundEffect('quizendscreen');
    } catch (error) {
      console.error('Error playing end screen sound:', error);
      // Component will still display normally even if sound fails
    }
  });
</script>

<div class="animate fade-in-from-top space-y-5 text-center text-white md:w-[32rem]">
  <h1 class="mb-4 text-2xl font-bold md:text-3xl">Congratulations!</h1>
  <div class="space-y-2 md:text-lg">
    <i class="fa-solid fa-trophy fa-3x mb-4 text-yellow-300"></i>
    <p>You've completed the quiz!</p>
    <p>Your score: {$quizStore.score} / {$quizStore.questions.length}</p>
  </div>
  <Button onclick={onrestart} variant="primary" customClass="w-44 text-lg font-semibold mx-auto">
    Start New Quiz
  </Button>
</div>
