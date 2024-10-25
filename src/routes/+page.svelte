<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { onMount } from 'svelte';

	import {
		resetQuiz,
		selectCategory,
		selectDifficulty,
		selectQuestionCount,
		startQuiz
	} from '$lib/utils/quizUtils';

	import {
		setQuizCategory,
		selectedCategory,
		selectedDifficulty,
		selectedQuestionCount
	} from '$lib/stores/quizStore';

	import {
		QUIZ_CATEGORIES,
		QUIZ_DIFFICULTIES,
		QUIZ_QUESTION_COUNTS,
		STAGGER_DELAY_CLASSES
	} from '$lib/utils/quizConstants';

	function handleStartQuiz() {
		try {
			const path = startQuiz(
				$selectedCategory,
				$selectedDifficulty,
				$selectedQuestionCount,
				setQuizCategory
			);
			goto(path);
		} catch (error) {
			alert(error.message);
		}
	}

	onMount(() => {
		resetQuiz();
	});
</script>

<div class="flex flex-col mx-auto text-center text-white gap-1 opacity-95">
	<div class="fade-in delay-1">
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

	<hr class="mt-7 border border-yellow-400 fade-in delay-2" />

	<div class="flex flex-col gap-2 mt-7">
		<h2 class="font-semibold uppercase fade-in delay-2">Select a category:</h2>
		<div class="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
			{#each QUIZ_CATEGORIES as category, i}
				<div class="stagger-fade-in {STAGGER_DELAY_CLASSES[i]}">
					<Button
						onclick={() => selectCategory(selectedCategory, category)}
						selected={$selectedCategory === category.toLowerCase()}
						fullWidth
					>
						{category}
					</Button>
				</div>
			{/each}
		</div>

		<div class="fade-in delay-2">
			<div class="mb-6">
				<h2 class="font-semibold uppercase mb-2">Select difficulty:</h2>
				<div class="space-x-2">
					{#each QUIZ_DIFFICULTIES as difficulty}
						<Button
							onclick={() => selectDifficulty(selectedDifficulty, difficulty)}
							selected={$selectedDifficulty === difficulty.toLowerCase()}
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
							onclick={() => selectQuestionCount(selectedQuestionCount, count)}
							selected={$selectedQuestionCount === count}
						>
							{count}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<Button
			onclick={handleStartQuiz}
			disabled={!$selectedCategory || !$selectedDifficulty || !$selectedQuestionCount}
			variant="primary"
			customClass="w-36 text-lg font-semibold mx-auto fade-in delay-3 mt-7"
		>
			Start Quiz
		</Button>
	</div>
</div>
