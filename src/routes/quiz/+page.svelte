<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { quizCategory } from '$lib/stores/quizCategoryStore';
	import {
		questions,
		currentQuestionIndex,
		score,
		loading,
		selectedAnswer,
		isAnswerCorrect
	} from '$lib/stores/quizStore';
	import { fetchQuestions, handleAnswer, resetQuiz } from '$lib/utils/quizUtils';
	import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';
	import { goto } from '$app/navigation';

	let loadError = $state(false);
	let quizEnded = $state(false);
	let shuffledAnswers = $state([]);

	onMount(async () => {
		const categoryId = $page.url.searchParams.get('category');
		const difficulty = $page.url.searchParams.get('difficulty');
		const questionCount = $page.url.searchParams.get('questions');

		try {
			await fetchQuestions(categoryId, difficulty, questionCount);
		} catch (e) {
			console.error('Failed to load questions. Please try again.');
			loadError = true;
		}
	});

	function handleQuizAnswer(answer) {
		$selectedAnswer = answer;
		$isAnswerCorrect = answer === currentQuestion.correct_answer;
		handleAnswer(answer);

		setTimeout(() => {
			if ($currentQuestionIndex >= $questions.length - 1) {
				quizEnded = true;
			} else {
				$selectedAnswer = null;
				$isAnswerCorrect = null;
				currentQuestionIndex.update((n) => n + 1);
			}
		}, 2000);
	}

	function restartQuiz() {
		resetQuiz();
		goto('/');
	}

	let currentQuestion = $derived($questions[$currentQuestionIndex]);

	$effect(() => {
		if (currentQuestion) {
			shuffledAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort(
				() => Math.random() - 0.5
			);
		}
	});

	function formatCategoryName(category) {
		if (!category) return 'Quiz';
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<div class="text-white text-center md:w-[32rem] fade-in delay-1">
	<h1 class="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
		{$quizCategory.charAt(0).toUpperCase() + $quizCategory.slice(1)} Quiz
	</h1>

	{#if $loading}
		<p>Loading questions...</p>
	{:else if loadError}
		<p class="text-red-500">Failed to load questions. Please try again.</p>
	{:else if quizEnded}
		<QuizEndScreen on:restart={restartQuiz} />
	{:else if currentQuestion && $questions.length > 0}
		<div>
			<h2 class="text-xl mb-2">Question {$currentQuestionIndex + 1} of {$questions.length}</h2>
			<p class="mb-4 h-20 md:h-12">{@html currentQuestion.question}</p>

			<div class="space-y-2 fade-in delay-2">
				{#each shuffledAnswers as answer (answer)}
					<button
						class={`w-full p-2 rounded-md transition-colors duration-200 ${
							$selectedAnswer === null
								? 'bg-white text-black hover:bg-blue-500 hover:text-white'
								: $selectedAnswer === answer
									? $isAnswerCorrect
										? 'bg-green-500 text-white'
										: 'bg-red-500 text-white'
									: 'bg-white text-black'
						}`}
						disabled={$selectedAnswer !== null}
						onclick={() => handleQuizAnswer(answer)}
					>
						{@html answer}
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<p>No questions available. Please try again.</p>
	{/if}

	{#if !quizEnded}
		<div class="mt-8 fade-in delay-3">
			<p>Score: {$score} / {$questions.length}</p>
		</div>
	{/if}
</div>
