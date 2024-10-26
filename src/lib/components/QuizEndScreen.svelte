<script>
	// Event handling for parent component communication
	import { createEventDispatcher } from 'svelte';
	// Navigation
	import { goto } from '$app/navigation';

	// Quiz utilities and stores
	import { resetQuiz } from '$lib/utils/quizUtils';
	import { questions, score } from '$lib/stores/quizStore';

	// UI Component
	import Button from './Button.svelte';

	// Creates a dispatcher to send events up to parent components, allowing child-to-parent communication
	const dispatch = createEventDispatcher();

	function restartQuiz() {
		resetQuiz(); // Clear all quiz state
		dispatch('restart'); // Notify parent component
		goto('/'); // Navigate to home page
	}

	// Compute total questions once and update when $questions changes
	let totalQuestions = $derived($questions.length);
</script>

<div class="text-white text-center md:w-[32rem] space-y-5">
	<h1 class="text-2xl md:text-3xl font-bold mb-4">Congratulations!</h1>
	<div class="md:text-lg">
		<p>You've completed the quiz! <i class="fa-solid fa-trophy text-yellow-300"></i></p>
		<p>Your score: {$score} / {totalQuestions}</p>
		<p class="balanced-text">
			{#if $score === totalQuestions}
				Perfect score! You're a quiz&nbsp;master!
			{:else if $score > totalQuestions / 2}
				Great job! You did well!
			{:else}
				Nice try! There's room for improvement.
			{/if}
		</p>
	</div>
	<Button onclick={restartQuiz} variant="primary" customClass="w-44 text-lg font-semibold mx-auto">
		Start New Quiz
	</Button>
</div>
