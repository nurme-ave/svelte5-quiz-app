<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import { fetchQuestions, handleAnswer, resetQuiz, shuffleArray } from '$lib/utils/quizUtils';

	import Button from '$lib/components/Button.svelte';
	import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';

	import {
		quizCategory,
		questions,
		currentQuestionIndex,
		score,
		loading,
		selectedAnswer,
		isAnswerCorrect
	} from '$lib/stores/quizStore';

	const QUESTION_TIME_LIMIT = 10; // 10 seconds per question

	let quizState = $state({
		loadError: false,
		quizEnded: false,
		shuffledAnswers: [],
		currentQuestion: null,
		totalTime: 0,
		questionTime: QUESTION_TIME_LIMIT
	});

	// Main timer effect
	$effect(() => {
		if ($loading || quizState.quizEnded || quizState.loadError) {
			return;
		}

		const timer = setInterval(() => {
			quizState.totalTime += 1;
			quizState.questionTime -= 1;

			// Time's up for current question
			if (quizState.questionTime === 0) {
				handleTimeUp();
			}
		}, 1000);

		return () => clearInterval(timer);
	});

	// Reset question timer when question changes
	$effect(() => {
		if ($currentQuestionIndex !== null) {
			quizState.questionTime = QUESTION_TIME_LIMIT;
		}
	});

	onMount(async () => {
		const categoryId = $page.url.searchParams.get('category');
		const difficulty = $page.url.searchParams.get('difficulty');
		const questionCount = $page.url.searchParams.get('questions');

		try {
			await fetchQuestions(categoryId, difficulty, questionCount);
		} catch (e) {
			console.error('Failed to load questions. Please try again.');
			quizState.loadError = true;
		}
	});

	// Update current question when questions or index changes
	$effect(() => {
		quizState.currentQuestion = $questions[$currentQuestionIndex] || null;
	});

	$effect(() => {
		if (quizState.currentQuestion) {
			const answers = [
				...quizState.currentQuestion.incorrect_answers,
				quizState.currentQuestion.correct_answer
			];
			quizState.shuffledAnswers = shuffleArray(answers);
		}
	});

	function handleTimeUp() {
		// If no answer selected, count as incorrect
		if ($selectedAnswer === null) {
			handleAnswer(null);
		}

		// Move to next question or end quiz
		if ($currentQuestionIndex >= $questions.length - 1) {
			quizState.quizEnded = true;
		} else {
			$selectedAnswer = null;
			$isAnswerCorrect = null;
			currentQuestionIndex.update((n) => n + 1);
		}
	}

	function handleQuizAnswer(answer) {
		$selectedAnswer = answer;
		$isAnswerCorrect = answer === quizState.currentQuestion.correct_answer;
		handleAnswer(answer);

		// Remove setTimeout and handle progression immediately
		if ($currentQuestionIndex >= $questions.length - 1) {
			quizState.quizEnded = true;
		} else {
			$selectedAnswer = null;
			$isAnswerCorrect = null;
			currentQuestionIndex.update((n) => n + 1);
		}
	}

	function restartQuiz() {
		resetQuiz();
		goto('/');
	}

	function getAnswerButtonClasses(answer) {
		const baseClasses = 'w-full p-2 rounded-md transition-colors duration-200';

		if ($selectedAnswer === null) {
			return `${baseClasses} bg-white text-black hover:bg-blue-500 hover:text-white`;
		}

		if ($selectedAnswer === answer) {
			return $isAnswerCorrect
				? `${baseClasses} bg-green-500 text-white`
				: `${baseClasses} bg-red-500 text-white`;
		}

		return `${baseClasses} bg-white text-black`;
	}

	function formatCategoryName(category) {
		if (!category) return 'Quiz';
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function getProgressPercentage() {
		return (quizState.questionTime / QUESTION_TIME_LIMIT) * 100;
	}

	function getProgressBarColor(timeLeft) {
		const percentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
		if (percentage <= 30) return 'bg-red-500';
		if (percentage <= 60) return 'bg-yellow-500';
		return 'bg-green-500';
	}
</script>

<div class="mx-auto text-white md:w-[32rem] fade-in-from-top delay-1">
	<h1 class="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
		{formatCategoryName($quizCategory)} Quiz
	</h1>

	{#if $loading}
		<p>Loading questions...</p>
	{:else if quizState.loadError}
		<p class="text-red-500">Failed to load questions. Please try again.</p>
	{:else if quizState.quizEnded}
		<QuizEndScreen on:restart={restartQuiz} />
		<p class="text-center mt-4">Total Time: {formatTime(quizState.totalTime)}</p>
	{:else if quizState.currentQuestion && $questions.length > 0}
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-lg">Question {$currentQuestionIndex + 1} of {$questions.length}</h2>
			<p class="text-sm">Total Time: {formatTime(quizState.totalTime)}</p>
		</div>

		<!-- Progress bar -->
		<div class="w-full h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
			<div
				class="h-full {getProgressBarColor(quizState.questionTime)} origin-left"
				style="width: {getProgressPercentage()}%; transition: width {quizState.questionTime ===
				QUESTION_TIME_LIMIT
					? '0s'
					: '1s'} linear"
			></div>
		</div>

		<div class="fade-in-from-top delay-3">
			<p class="mb-8">{@html quizState.currentQuestion.question}</p>

			<div class="space-y-2 delay-3">
				{#each quizState.shuffledAnswers as answer (answer)}
					<button
						class={getAnswerButtonClasses(answer)}
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

	<div class="mt-8 fade-in-from-top delay-3 flex flex-col gap-4">
		{#if !quizState.quizEnded}
			<p>Score: {$score} / {$questions.length}</p>
			<Button
				onclick={restartQuiz}
				variant="primary"
				customClass="w-32 bg-red-500 hover:bg-red-600 border-red-500 mx-auto mt-4"
			>
				Start Over
			</Button>
		{/if}
	</div>
</div>
