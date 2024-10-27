<script>
	import { quizStore, updateQuizState } from '$lib/stores/quizStore';

	let { question, shuffledAnswers = [], onAnswerSelect = () => {} } = $props();

	function getAnswerButtonClasses(answer) {
		const baseClasses = 'w-full px-2 py-3 rounded-md transition-colors duration-200';

		if (!$quizStore.selectedAnswer) {
			return `${baseClasses} bg-white text-black hover:bg-blue-500 hover:text-white`;
		}

		if ($quizStore.selectedAnswer === answer) {
			return $quizStore.isAnswerCorrect
				? `${baseClasses} bg-green-500 text-white`
				: `${baseClasses} bg-red-500 text-white`;
		}

		return `${baseClasses} bg-white text-black`;
	}
</script>

<div class="w-full">
	<div class="flex items-center justify-center h-[5rem] sm:h-[4rem] lg:h-[3.5rem] px-4 mb-8 w-full">
		<!-- @html directive safely converts and renders HTML strings, including HTML entities.  -->
		<p class="text-center">{@html question}</p>
	</div>

	<div class="grid gap-2 w-full">
		{#each shuffledAnswers as answer (answer)}
			<button
				class={getAnswerButtonClasses(answer)}
				disabled={$quizStore.selectedAnswer !== null}
				onclick={() => onAnswerSelect(answer)}
				aria-pressed={$quizStore.selectedAnswer === answer}
				aria-disabled={$quizStore.selectedAnswer !== null}
			>
				{@html answer}
			</button>
		{/each}
	</div>
</div>
