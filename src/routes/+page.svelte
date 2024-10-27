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

	let isLoading = $state(false);
	let loadingProgress = $state('');
	let countdown = $state(3);
	let isNavigating = $state(false);
	let countdownTimer;

	async function handleStartQuiz() {
		if (!$selectedCategory || !$selectedDifficulty || !$selectedQuestionCount) {
			alert('Please select a category, difficulty level, and number of questions.');
			return;
		}

		try {
			isLoading = true;

			const { path, loadingPromise } = await startQuiz(
				$selectedCategory,
				$selectedDifficulty,
				$selectedQuestionCount,
				setQuizCategory
			);

			loadingProgress = 'Preparing quiz...';
			await loadingPromise;

			loadingProgress = 'Get Ready!';

			// Countdown using a controlled timer
			await new Promise((resolve) => {
				let remaining = countdown;
				countdownTimer = setInterval(() => {
					if (remaining > 0) {
						remaining--;
						countdown = remaining;
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
			isLoading = false;
			loadingProgress = '';
			countdown = 3;
			// isNavigating stays true during navigation
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

<!-- Loading overlay -->
{#if isLoading || isNavigating}
	<div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
		<div class="text-center">
			<div class="text-2xl text-yellow-300 mb-6">{loadingProgress}</div>

			{#if loadingProgress === 'Get Ready!'}
				<div class="text-6xl font-bold text-yellow-300 animate-bounce">
					{countdown}
				</div>
			{:else}
				<div class="flex items-center justify-center gap-3">
					<div
						class="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
						style="animation-delay: 0s"
					></div>
					<div
						class="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
						style="animation-delay: 0.2s"
					></div>
					<div
						class="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
						style="animation-delay: 0.4s"
					></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<div class="text-white opacity-95">
	<div class="animate fade-in-from-top delay-1">
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

	<hr class="mt-7 border border-yellow-400 animate fade-in-from-top delay-2" />

	<div class="flex flex-col gap-2 mt-7">
		<h2 class="font-semibold uppercase animate fade-in-from-top delay-2">Select a category:</h2>
		<div class="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
			{#each QUIZ_CATEGORIES as category, i}
				<div class="animate stagger-fade-in {STAGGER_DELAY_CLASSES[i]}">
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

		<div class="animate fade-in-from-top delay-2">
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
			disabled={!$selectedCategory || !$selectedDifficulty || !$selectedQuestionCount || isLoading}
			variant="primary"
			customClass="w-36 text-lg font-semibold mx-auto fade-in-from-top delay-3 mt-7"
		>
			Start Quiz
		</Button>
	</div>
</div>
