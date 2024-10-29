<script>
	// SvelteKit specific imports
	import { goto } from '$app/navigation'; // For navigation
	import { onMount } from 'svelte'; // Lifecycle hook

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

	// Store references and constants
	let gameTimer; // Reference to the main interval timer for quiz timing

	// Constants
	const QUESTION_TIME_LIMIT = 15; // Seconds allowed per quiz question

	// Consolidated states for better organization and maintenance

	// Quiz-related state - handles UI flow and answer management
	let quizState = $state({
		loadError: false, // Tracks API or data loading failures
		quizEnded: false, // Indicates quiz completion status
		shuffledAnswers: [], // Randomized answer options for current question
		isInitializing: true // Controls initial loading state
	});

	// Timer-related state - manages all timing concerns
	let timerState = $state({
		totalTime: 0, // Total elapsed quiz time in seconds
		questionTime: QUESTION_TIME_LIMIT, // Countdown timer for current question
		lastTick: 0 // Timestamp for drift prevention
	});

	// Updates document title and meta description based on selected quiz category
	// Improves SEO and user experience with dynamic metadata
	$effect(() => {
		if ($quizStore.selectedCategory) {
			const category = $quizStore.selectedCategory;
			const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

			document.title = `${formattedCategory} Quiz | Quiz App`;
			document
				.querySelector('meta[name="description"]')
				.setAttribute(
					'content',
					`Test your knowledge in ${formattedCategory}. Take our interactive quiz and challenge yourself!`
				);
		} else {
			// Reset to default when no category is selected
			document.title = 'Quiz App - Built With Svelte';
			document
				.querySelector('meta[name="description"]')
				.setAttribute('content', 'Test your knowledge with our interactive quiz application');
		}
	});

	// Timer management effect with drift prevention
	// Uses performance.now() to ensure accurate timing even with browser throttling
	// Automatically cleans up on component unmount or when dependencies change
	$effect(() => {
		if (!quizState.quizEnded && !quizState.isInitializing && !quizState.loadError) {
			gameTimer = setInterval(() => {
				const now = performance.now();

				// Only update if enough time has passed (helps prevent drift)
				if (now - timerState.lastTick >= 1000) {
					timerState.totalTime += 1;
					timerState.questionTime -= 1;
					timerState.lastTick = now;

					if (timerState.questionTime === 0) {
						handleTimeUp();
					}
				}
			}, 1000);

			// This cleanup runs automatically:
			// - When component unmounts
			// - When dependencies change and effect re-runs
			return () => {
				if (gameTimer) {
					clearInterval(gameTimer);
					gameTimer = null;
				}
			};
		}
	});

	// Initialize quiz data and state
	// Sets up initial question data and timing mechanism
	onMount(() => {
		try {
			if ($quizStore.questions.length > 0) {
				updateShuffledAnswers($currentQuestion);
				timerState.lastTick = performance.now(); // Initialize lastTick
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

	// Helper Functions

	// Updates the shuffled answers array for a given question
	function updateShuffledAnswers(question) {
		if (question) {
			quizState.shuffledAnswers = shuffleArray([
				...question.incorrect_answers,
				question.correct_answer
			]);
		}
	}

	// Reactive Updates

	// Handles question transitions and resets timer for new questions
	$effect(() => {
		if ($currentQuestion && $quizStore.selectedAnswer === null) {
			updateShuffledAnswers($currentQuestion);
			timerState.questionTime = QUESTION_TIME_LIMIT;
		}
	});

	// Quiz Flow Functions

	// Handles timer expiration for current question
	// Processes as incorrect answer if no selection made
	function handleTimeUp() {
		if (!$quizStore.selectedAnswer) {
			handleAnswer(null);
		}
		advanceQuiz();
	}

	// Processes user's answer selection
	// Updates score and triggers question transition after display duration
	function handleQuizAnswer(answer) {
		// Process the answer
		const isCorrect = answer === $currentQuestion.correct_answer;

		updateQuizState({
			selectedAnswer: answer,
			isAnswerCorrect: isCorrect,
			score: isCorrect ? $quizStore.score + 1 : $quizStore.score
		});

		// Using regular setTimeout instead of $effect
		setTimeout(advanceQuiz, ANSWER_DISPLAY_DURATION);
	}

	// Advances quiz to next question or ends quiz if complete
	// Resets question timer and updates quiz state
	function advanceQuiz() {
		if ($isQuizComplete) {
			quizState.quizEnded = true;
		} else {
			updateQuizState({
				selectedAnswer: null,
				isAnswerCorrect: null,
				currentQuestionIndex: $quizStore.currentQuestionIndex + 1
			});

			// Reset question time for the new question
			timerState.questionTime = QUESTION_TIME_LIMIT;
		}
	}

	// Navigation and Utility Functions

	// Resets quiz state and redirects to home page
	// Used for both manual restarts and quiz completion
	function restartQuiz() {
		resetQuiz();
		goto('/');
	}

	// Formats category name for display
	function formatCategoryName(category) {
		if (!category) return 'Quiz';
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<div class="mx-auto text-white max-w-lg w-full">
	<h1 class="text-2xl md:text-3xl font-bold mb-8 text-yellow-300">
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
			<QuizEndScreen onrestart={restartQuiz} totalTime={timerState.totalTime} />
		</div>
	{:else if $currentQuestion && $quizStore.questions.length > 0}
		<div class="flex justify-between items-center mb-6 text-base">
			<h2>Question {$quizStore.currentQuestionIndex + 1} of {$quizStore.questions.length}</h2>
			<p>Total Time: {formatTime(timerState.totalTime)}</p>
		</div>

		<QuizTimer timeLimit={QUESTION_TIME_LIMIT} currentTime={timerState.questionTime} />

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
