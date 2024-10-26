<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import Button from '$lib/components/Button.svelte';
	import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';

	import { ANSWER_DISPLAY_DURATION } from '$lib/utils/quizConstants';
	import { fetchQuestions, handleAnswer, resetQuiz, shuffleArray } from '$lib/utils/quizUtils';

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
	const COUNTDOWN_START = 3; // Start countdown from 3

	let quizState = $state({
		loadError: false,
		quizEnded: false,
		shuffledAnswers: [],
		currentQuestion: null,
		totalTime: 0,
		questionTime: QUESTION_TIME_LIMIT,
		countdown: COUNTDOWN_START,
		quizStarted: false
	});

	// Countdown effect
	$effect(() => {
		if ($loading || quizState.quizStarted || quizState.loadError) {
			return;
		}

		if ($questions.length > 0 && quizState.countdown > 0) {
			const timer = setInterval(() => {
				quizState.countdown -= 1;
				if (quizState.countdown === 0) {
					quizState.quizStarted = true;
				}
			}, 1000);

			return () => clearInterval(timer);
		}
	});

	// Main timer effect
	$effect(() => {
		if ($loading || !quizState.quizStarted || quizState.quizEnded || quizState.loadError) {
			return;
		}

		const timer = setInterval(() => {
			quizState.totalTime += 1;
			quizState.questionTime -= 1;

			if (quizState.questionTime === 0) {
				handleTimeUp();
			}
		}, 1000);

		return () => clearInterval(timer);
	});

	// Reset question timer when question changes
	$effect(() => {
		if ($currentQuestionIndex !== null && quizState.quizStarted) {
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
		if ($selectedAnswer === null) {
			handleAnswer(null);
		}

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

		setTimeout(() => {
			if ($currentQuestionIndex >= $questions.length - 1) {
				quizState.quizEnded = true;
			} else {
				$selectedAnswer = null;
				$isAnswerCorrect = null;
				currentQuestionIndex.update((n) => n + 1);
			}
		}, ANSWER_DISPLAY_DURATION);
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

	{#if quizState.loadError}
		<p class="text-red-500">Failed to load questions. Please try again.</p>
	{:else if !quizState.quizStarted && quizState.countdown > 0}
		<div class="text-center py-12">
			<p class="text-2xl mb-8">Get Ready!</p>
			<p class="text-6xl font-bold text-yellow-300 animate-bounce">{quizState.countdown}</p>
		</div>
	{:else if quizState.quizEnded}
		<QuizEndScreen on:restart={restartQuiz} />
		<p class="text-center mt-4">Total Time: {formatTime(quizState.totalTime)}</p>
	{:else if quizState.currentQuestion && $questions.length > 0}
		<div class="flex justify-between items-center mb-6 text-base">
			<h2>Question {$currentQuestionIndex + 1} of {$questions.length}</h2>
			<p>Total Time: {formatTime(quizState.totalTime)}</p>
		</div>

		<!-- Progress bar -->
		<div class="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
			<div
				class="h-full {getProgressBarColor(quizState.questionTime)} origin-left"
				style="width: {getProgressPercentage()}%; transition: width {quizState.questionTime ===
				QUESTION_TIME_LIMIT
					? '0s'
					: '1s'} linear"
			></div>
		</div>

		<div class="flex flex-col">
			<div class="flex flex-col justify-center items-center w-full">
				<div class="flex items-center justify-center h-[5rem] sm:h-[4rem] lg:h-[3.5rem] px-4 mb-8">
					<p class="text-center">{@html quizState.currentQuestion.question}</p>
				</div>

				<div class="space-y-2 delay-3 w-full">
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
				Restart
			</Button>
		{/if}
	</div>
</div>
