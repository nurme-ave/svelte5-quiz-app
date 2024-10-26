<script>
	// SvelteKit specific imports
	import { page } from '$app/stores'; // For accessing URL parameters
	import { goto } from '$app/navigation'; // For navigation
	import { onMount } from 'svelte'; // Lifecycle hook

	// UI Component imports
	import Button from '$lib/components/Button.svelte';
	import QuizTimer from '$lib/components/QuizTimer.svelte';
	import QuizQuestion from '$lib/components/QuizQuestion.svelte';
	import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';

	// Quiz-specific utilities and stores
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

	// Constants
	const QUESTION_TIME_LIMIT = 15; // Seconds per question
	const COUNTDOWN_START = 5; // Initial countdown duration

	let quizState = $state({
		loadError: false, // Tracks if there was an error loading questions
		quizEnded: false, // Indicates if the quiz is complete
		shuffledAnswers: [], // Randomized answer options
		currentQuestion: null, // Current question being displayed
		totalTime: 0, // Total time spent on quiz
		questionTime: QUESTION_TIME_LIMIT, // Time remaining for current question
		countdown: COUNTDOWN_START, // Initial countdown value
		quizStarted: false // Indicates if quiz has started after countdown
	});

	// Initialize quiz on mount
	onMount(async () => {
		loading.set(true);
		try {
			// Get quiz parameters from URL
			const categoryId = $page.url.searchParams.get('category');
			const difficulty = $page.url.searchParams.get('difficulty');
			const questionCount = $page.url.searchParams.get('questions');

			if (!categoryId || !difficulty || !questionCount) {
				throw new Error('Missing required parameters');
			}

			// Fetch questions and start countdown
			await fetchQuestions(categoryId, difficulty, questionCount);
			startCountdown();
		} catch (error) {
			console.error('Failed to load questions:', error);
			quizState.loadError = true;
		} finally {
			loading.set(false);
		}
	});

	// Handles the initial countdown before quiz starts
	function startCountdown() {
		const timer = setInterval(() => {
			if (quizState.countdown > 0) {
				quizState.countdown -= 1;
			} else {
				clearInterval(timer);
				quizState.quizStarted = true;
				startQuizTimer();
			}
		}, 1000);
	}

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

		return () => clearInterval(timer);
	}

	// Updates current question when question index changes
	$effect(() => {
		if ($questions.length > 0 && $currentQuestionIndex != null) {
			const currentQ = $questions[$currentQuestionIndex];
			if (currentQ) {
				quizState.currentQuestion = currentQ;

				// Shuffle answers including the correct one
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
		$selectedAnswer = answer;
		$isAnswerCorrect = answer === quizState.currentQuestion.correct_answer;
		handleAnswer(answer);
		setTimeout(advanceQuiz, ANSWER_DISPLAY_DURATION);
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

	// Formats seconds into MM:SS
	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

	{#if quizState.loadError}
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
	{:else if !quizState.quizStarted && quizState.countdown > 0}
		<div class="text-center py-12">
			<p class="text-2xl mb-10">Get Ready!</p>
			<p class="text-5xl font-bold text-yellow-300 animate-bounce">{quizState.countdown}</p>
		</div>
	{:else if quizState.quizEnded}
		<QuizEndScreen onrestart={restartQuiz} />
		<p class="text-center mt-4">Total Time: {formatTime(quizState.totalTime)}</p>
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
	{:else}
		<div class="text-center">
			<p class="mb-4">No questions available. Please try again.</p>
			<Button
				onclick={restartQuiz}
				variant="primary"
				customClass="w-32 bg-red-500 hover:bg-red-600 border-red-500"
			>
				Go Back
			</Button>
		</div>
	{/if}
</div>
