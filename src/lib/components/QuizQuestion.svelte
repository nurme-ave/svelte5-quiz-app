<script>
	let {
		question,
		shuffledAnswers = [],
		selectedAnswer = null,
		isAnswerCorrect = false,
		onAnswerSelect = () => {}
	} = $props();

	function getAnswerButtonClasses(answer) {
		const baseClasses = 'w-full px-2 py-3 rounded-md transition-colors duration-200';

		if (!selectedAnswer) {
			return `${baseClasses} bg-white text-black hover:bg-blue-500 hover:text-white`;
		}

		if (selectedAnswer === answer) {
			return isAnswerCorrect
				? `${baseClasses} bg-green-500 text-white`
				: `${baseClasses} bg-red-500 text-white`;
		}

		return `${baseClasses} bg-white text-black`;
	}
</script>

<div class="w-full">
	<div class="flex items-center justify-center h-[5rem] sm:h-[4rem] lg:h-[3.5rem] px-4 mb-8 w-full">
		<p class="text-center">{@html question}</p>
	</div>

	<div class="grid gap-2 w-full">
		{#each shuffledAnswers as answer (answer)}
			<button
				class={getAnswerButtonClasses(answer)}
				disabled={selectedAnswer !== null}
				onclick={() => onAnswerSelect(answer)}
			>
				{@html answer}
			</button>
		{/each}
	</div>
</div>
