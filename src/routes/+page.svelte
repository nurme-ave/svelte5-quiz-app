<script>
	import { goto } from '$app/navigation';
	import { setQuizCategory } from '$lib/stores/quizCategoryStore';
	import { categoryMapping } from '$lib/utils/categoryMapping';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount } from 'svelte';
	import { resetQuiz } from '$lib/utils/quizUtils';
	import {
		selectedCategory,
		selectedDifficulty,
		selectedQuestionCount
	} from '$lib/stores/quizStore';

	const categories = ['Film', 'Music', 'Sports', 'History', 'Vehicles', 'Geography'];
	const difficulties = ['Easy', 'Medium', 'Hard'];
	const questionCounts = [5, 10, 15];

	function selectCategory(category) {
		$selectedCategory = category.toLowerCase();
	}

	function selectDifficulty(difficulty) {
		$selectedDifficulty = difficulty.toLowerCase();
	}

	function selectQuestionCount(count) {
		$selectedQuestionCount = count;
	}

	function startQuiz() {
		if ($selectedCategory && $selectedDifficulty && $selectedQuestionCount) {
			const categoryId = categoryMapping[$selectedCategory];
			setQuizCategory($selectedCategory);
			goto(
				`/quiz?category=${categoryId}&difficulty=${$selectedDifficulty}&questions=${$selectedQuestionCount}`
			);
		} else {
			alert('Please select a category, difficulty level, and number of questions.');
		}
	}

	onMount(() => {
		resetQuiz();
	});
</script>

<div class="flex flex-col mx-auto text-center text-white gap-1 opacity-95">
	<!-- <h1 class="text-4xl md:text-5xl font-semibold pb-3 uppercase fade-in delay-1 balanced-text"> -->
	<h1 class="text-4xl md:text-5xl font-semibold pb-3 uppercase balanced-text">
		Welcome to the <span class="text-yellow-300">Quiz&nbsp;</span>App
	</h1>
	<!-- <p class="md:text-xl fade-in delay-2 balanced-text"> -->
	<p class="md:text-xl balanced-text">Make your selections below and start the&nbsp;quiz.</p>
	<!-- <div class="md:text-xl flex gap-2 items-center justify-center fade-in delay-2"> -->
	<div class="md:text-xl flex gap-2 items-center justify-center">
		<p>Good luck!</p>
		<Icon
			icon="heroicons-solid:star"
			class="text-yellow-400 transition-transform hover:scale-110 text-2xl"
		/>
	</div>

	<hr class="mt-7 border border-yellow-400" />

	<!-- <div class="flex flex-col gap-2 mt-7 fade-in delay-3"> -->
	<div class="flex flex-col gap-2 mt-7">
		<h2 class="font-semibold uppercase">Select a category:</h2>
		<div class="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
			{#each categories as category}
				<Button
					onClick={() => selectCategory(category)}
					selected={$selectedCategory === category.toLowerCase()}
				>
					{category}
				</Button>
			{/each}
		</div>

		<h2 class="font-semibold uppercase">Select difficulty:</h2>
		<div class="mb-4">
			{#each difficulties as difficulty}
				<Button
					onClick={() => selectDifficulty(difficulty)}
					selected={$selectedDifficulty === difficulty.toLowerCase()}
				>
					{difficulty}
				</Button>
			{/each}
		</div>

		<h2 class="font-semibold uppercase">Select number of questions:</h2>
		<div class="mb-4">
			{#each questionCounts as count}
				<Button
					onClick={() => selectQuestionCount(count)}
					selected={$selectedQuestionCount === count}
				>
					{count}
				</Button>
			{/each}
		</div>

		<Button
			onClick={startQuiz}
			disabled={!$selectedCategory || !$selectedDifficulty || !$selectedQuestionCount}
			variant="primary"
			customClass="w-36 mt-3 text-lg font-semibold mx-auto"
		>
			Start Quiz
		</Button>
	</div>
</div>
