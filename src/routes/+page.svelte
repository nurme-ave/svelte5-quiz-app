<script>
	import { goto } from '$app/navigation';
	import { setQuizCategory } from '$lib/stores/quizCategoryStore';
	import { categoryMapping } from '$lib/utils/categoryMapping';
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
	const questionCounts = [2, 10, 15];
	const staggerDelayClasses = [
		'stagger-delay-0',
		'stagger-delay-1',
		'stagger-delay-2',
		'stagger-delay-3',
		'stagger-delay-4',
		'stagger-delay-5'
	];

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
			{#each categories as category, i}
				<div class="stagger-fade-in {staggerDelayClasses[i]}">
					<Button
						onclick={() => selectCategory(category)}
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
					{#each difficulties as difficulty}
						<Button
							onclick={() => selectDifficulty(difficulty)}
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
					{#each questionCounts as count}
						<Button
							onclick={() => selectQuestionCount(count)}
							selected={$selectedQuestionCount === count}
						>
							{count}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<Button
			onclick={startQuiz}
			disabled={!$selectedCategory || !$selectedDifficulty || !$selectedQuestionCount}
			variant="primary"
			customClass="w-36 text-lg font-semibold mx-auto fade-in delay-3 mt-7"
		>
			Start Quiz
		</Button>
	</div>
</div>
