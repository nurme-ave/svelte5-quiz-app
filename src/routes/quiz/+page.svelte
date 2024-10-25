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

	let quizState = $state({
		loadError: false,
		quizEnded: false,
		shuffledAnswers: [],
		currentQuestion: null
	});

	// Update current question when questions or index changes
	$effect(() => {
		quizState.currentQuestion = $questions[$currentQuestionIndex] || null;
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
		}, 2000);
	}

	function restartQuiz() {
		resetQuiz();
		goto('/');
	}

	function shuffleAnswers(array) {
		let currentIndex = array.length;
		let randomIndex;

		while (currentIndex > 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	$effect(() => {
		if (quizState.currentQuestion) {
			const answers = [
				...quizState.currentQuestion.incorrect_answers,
				quizState.currentQuestion.correct_answer
			];
			quizState.shuffledAnswers = shuffleAnswers(answers);
		}
	});

	function formatCategoryName(category) {
		if (!category) return 'Quiz';
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<div class="text-white text-center md:w-[32rem] fade-in delay-1">
	<h1 class="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">
		{formatCategoryName($quizCategory)} Quiz
	</h1>

	{#if $loading}
		<p>Loading questions...</p>
	{:else if quizState.loadError}
		<p class="text-red-500">Failed to load questions. Please try again.</p>
	{:else if quizState.quizEnded}
		<QuizEndScreen on:restart={restartQuiz} />
	{:else if quizState.currentQuestion && $questions.length > 0}
		<div>
			<h2 class="text-xl mb-2">Question {$currentQuestionIndex + 1} of {$questions.length}</h2>
			<p class="mb-4">{@html quizState.currentQuestion.question}</p>

			<div class="space-y-2 fade-in delay-2">
				{#each quizState.shuffledAnswers as answer (answer)}
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

	{#if !quizState.quizEnded}
		<div class="mt-8 fade-in delay-3">
			<p>Score: {$score} / {$questions.length}</p>
		</div>
	{/if}
</div>
