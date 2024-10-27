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
		quizCategory,
		questions,
		currentQuestionIndex,
		score,
		selectedAnswer,
		isAnswerCorrect
	} from '$lib/stores/quizStore';

	let quizTimer; // Add reference to store the timer
	let answerTimeout; // Track answer timeout

	// Constants
	const QUESTION_TIME_LIMIT = 15; // Seconds per question

	let quizState = $state({
		loadError: false, // Tracks if there was an error loading questions
		quizEnded: false, // Indicates if the quiz is complete
		shuffledAnswers: [], // Randomized answer options
		currentQuestion: null, // Current question being displayed
		totalTime: 0, // Total time spent on quiz
		questionTime: QUESTION_TIME_LIMIT, // Time remaining for current question
		isInitializing: true
	});

	// Initialize quiz on mount
	onMount(() => {
		try {
			if ($questions.length > 0) {
				const currentQ = $questions[0];
				quizState.currentQuestion = currentQ;
				quizState.shuffledAnswers = shuffleArray([
					...currentQ.incorrect_answers,
					currentQ.correct_answer
				]);
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
		if (quizTimer) {
			clearInterval(quizTimer);
		}
		if (answerTimeout) {
			clearTimeout(answerTimeout);
		}
	});

	// Manages the timer during the quiz
	function startQuizTimer() {
		const timer = setInterval(() => {
			if (!quizState.quizEnded) {
				quizState.totalTime += 1;
				quizState.questionTime -= 1;

				if (quizState.questionTime === 0) {
					handleTimeUp();
				}
			} else {
				clearInterval(timer);
			}
		}, 1000);

		return timer; // Return timer reference
	}

	// Updates current question when question index changes
	$effect(() => {
		if ($questions.length > 0 && $currentQuestionIndex != null) {
			const currentQ = $questions[$currentQuestionIndex];
			if (currentQ) {
				quizState.currentQuestion = currentQ;
				quizState.shuffledAnswers = shuffleArray([
					...currentQ.incorrect_answers,
					currentQ.correct_answer
				]);
				quizState.questionTime = QUESTION_TIME_LIMIT;
			}
		}
	});

	// Handles when time runs out for a question
	function handleTimeUp() {
		if ($selectedAnswer === null) {
			handleAnswer(null);
		}
		advanceQuiz();
	}

	// Processes user's answer
	function handleQuizAnswer(answer) {
		// Clear any existing timeout
		if (answerTimeout) {
			clearTimeout(answerTimeout);
		}

		$selectedAnswer = answer;
		$isAnswerCorrect = answer === quizState.currentQuestion.correct_answer;
		handleAnswer(answer);

		// Set new timeout and store reference
		answerTimeout = setTimeout(advanceQuiz, ANSWER_DISPLAY_DURATION);
	}

	// Moves to next question or ends quiz
	function advanceQuiz() {
		if ($currentQuestionIndex >= $questions.length - 1) {
			quizState.quizEnded = true;
		} else {
			$selectedAnswer = null;
			$isAnswerCorrect = null;
			currentQuestionIndex.update((n) => n + 1);
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
		{formatCategoryName($quizCategory)} Quiz
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
	{:else if quizState.currentQuestion && $questions.length > 0}
		<div class="flex justify-between items-center mb-6 text-base">
			<h2>Question {$currentQuestionIndex + 1} of {$questions.length}</h2>
			<p>Total Time: {formatTime(quizState.totalTime)}</p>
		</div>

		<QuizTimer timeLimit={QUESTION_TIME_LIMIT} currentTime={quizState.questionTime} />

		<QuizQuestion
			question={quizState.currentQuestion.question}
			shuffledAnswers={quizState.shuffledAnswers}
			selectedAnswer={$selectedAnswer}
			isAnswerCorrect={$isAnswerCorrect}
			onAnswerSelect={handleQuizAnswer}
		/>

		<div class="mt-8 flex flex-col gap-4">
			<p>Score: {$score} / {$questions.length}</p>
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
