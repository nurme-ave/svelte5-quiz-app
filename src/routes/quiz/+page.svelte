<script>
	// SvelteKit specific imports
	import { goto } from '$app/navigation'; // For navigation
	import { onMount, onDestroy } from 'svelte'; // Lifecycle hook

	// UI Component imports
	import Button from '$lib/components/Button.svelte';
	import QuizTimer from '$lib/components/QuizTimer.svelte';
	import QuizQuestion from '$lib/components/QuizQuestion.svelte';
	import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';

	// Quiz-specific utilities and stores
	import { ANSWER_DISPLAY_DURATION } from '$lib/utils/quizConstants';
	import { handleAnswer, resetQuiz, shuffleArray, formatTime } from '$lib/utils/quizUtils';
	import {
		quizStore,
		updateQuizState,
		currentQuestion,
		isQuizComplete
	} from '$lib/stores/quizStore';

	let quizTimer; // Add reference to store the timer
	let answerTimeout; // Track answer timeout

	// Constants
	const QUESTION_TIME_LIMIT = 15; // Seconds per question

	let quizState = $state({
		loadError: false, // Tracks if there was an error loading questions
		quizEnded: false, // Indicates if the quiz is complete
		shuffledAnswers: [], // Randomized answer options
		totalTime: 0, // Total time spent on quiz
		questionTime: QUESTION_TIME_LIMIT, // Time remaining for current question
		isInitializing: true
	});

	// Initialize quiz on mount
	onMount(() => {
		try {
			if ($quizStore.questions.length > 0) {
				updateShuffledAnswers($currentQuestion);
				quizTimer = startQuizTimer();
			} else {
				throw new Error('No questions available');
			}
		} catch (error) {
			console.error('Failed to initialize quiz:', error);
			quizState.loadError = true;
		} finally {
			quizState.isInitializing = false;
		}
	});

	// Add cleanup
	onDestroy(() => {
		if (quizTimer) clearInterval(quizTimer);
		if (answerTimeout) clearTimeout(answerTimeout);
	});

	// Manages the timer during the quiz
	function startQuizTimer() {
		return setInterval(() => {
			if (!quizState.quizEnded) {
				quizState.totalTime += 1;
				quizState.questionTime -= 1;

				if (quizState.questionTime === 0) {
					handleTimeUp();
				}
			} else {
				clearInterval(quizTimer);
			}
		}, 1000);
	}

	function updateShuffledAnswers(question) {
		if (question) {
			quizState.shuffledAnswers = shuffleArray([
				...question.incorrect_answers,
				question.correct_answer
			]);
		}
	}
	// Updates current question when question index changes
	$effect(() => {
		if ($currentQuestion && $quizStore.selectedAnswer === null) {
			updateShuffledAnswers($currentQuestion);
			quizState.questionTime = QUESTION_TIME_LIMIT;
		}
	});

	// Handles when time runs out for a question
	function handleTimeUp() {
		if (!$quizStore.selectedAnswer) {
			handleAnswer(null);
		}
		advanceQuiz();
	}

	// Processes user's answer
	function handleQuizAnswer(answer) {
		// Clear the quiz timer (the countdown timer for questions)
		if (quizTimer) {
			clearInterval(quizTimer);
			quizTimer = null;
		}

		// Clear any existing answer timeout
		if (answerTimeout) {
			clearTimeout(answerTimeout);
			answerTimeout = null;
		}

		// Process the answer
		const isCorrect = answer === $currentQuestion.correct_answer;

		updateQuizState({
			selectedAnswer: answer,
			isAnswerCorrect: isCorrect,
			score: isCorrect ? $quizStore.score + 1 : $quizStore.score
		});

		answerTimeout = setTimeout(advanceQuiz, ANSWER_DISPLAY_DURATION);
	}

	// Moves to next question or ends quiz
	function advanceQuiz() {
		if (answerTimeout) {
			clearTimeout(answerTimeout);
			answerTimeout = null;
		}

		if ($isQuizComplete) {
			quizState.quizEnded = true;
			if (quizTimer) {
				clearInterval(quizTimer);
				quizTimer = null;
			}
		} else {
			updateQuizState({
				selectedAnswer: null,
				isAnswerCorrect: null,
				currentQuestionIndex: $quizStore.currentQuestionIndex + 1
			});

			// Restart the timer for the next question
			quizTimer = startQuizTimer();
		}
	}

	// Resets quiz and navigates to home
	function restartQuiz() {
		resetQuiz();
		goto('/');
	}

	// Formats category name with capitalized first letter
	function formatCategoryName(category) {
		if (!category) return 'Quiz';
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<div class="mx-auto text-white max-w-lg w-full">
	<h1 class="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
		{formatCategoryName($quizStore.selectedCategory)} Quiz
	</h1>

	{#if quizState.isInitializing}
		<!-- Show nothing during initialization -->
	{:else if quizState.loadError}
		<div class="text-center">
			<p class="text-red-500 mb-4">Failed to load questions. Please try again.</p>
			<Button
				onclick={restartQuiz}
				variant="primary"
				customClass="w-32 bg-red-500 hover:bg-red-600 border-red-500"
			>
				Go Back
			</Button>
		</div>
	{:else if quizState.quizEnded}
		<div class="space-y-4">
			<QuizEndScreen onrestart={restartQuiz} totalTime={quizState.totalTime} />
		</div>
	{:else if $currentQuestion && $quizStore.questions.length > 0}
		<div class="flex justify-between items-center mb-6 text-base">
			<h2>Question {$quizStore.currentQuestionIndex + 1} of {$quizStore.questions.length}</h2>
			<p>Total Time: {formatTime(quizState.totalTime)}</p>
		</div>

		<QuizTimer timeLimit={QUESTION_TIME_LIMIT} currentTime={quizState.questionTime} />

		<QuizQuestion
			question={$currentQuestion.question}
			shuffledAnswers={quizState.shuffledAnswers}
			selectedAnswer={$quizStore.selectedAnswer}
			isAnswerCorrect={$quizStore.isAnswerCorrect}
			onAnswerSelect={handleQuizAnswer}
		/>

		<div class="mt-8 flex flex-col gap-4">
			<p>Score: {$quizStore.score} / {$quizStore.questions.length}</p>
			<Button
				onclick={restartQuiz}
				variant="primary"
				customClass="w-32 bg-red-500 hover:bg-red-600 border-red-500 mx-auto mt-4"
			>
				Restart
			</Button>
		</div>
	{/if}
</div>
