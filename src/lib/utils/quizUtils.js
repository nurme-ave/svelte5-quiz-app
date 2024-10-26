import { get } from 'svelte/store';

import { preloadImage } from './imagePreloader';

import { CATEGORY_MAPPING, BACKGROUND_IMAGES } from './quizConstants';

import {
	questions,
	currentQuestionIndex,
	score,
	selectedCategory,
	selectedDifficulty,
	selectedQuestionCount,
	selectedAnswer,
	isAnswerCorrect
} from '../stores/quizStore';

export const QUIZ_API_BASE_URL = 'https://opentdb.com/api.php';

// Reverse mapping
export const CATEGORY_ID_TO_NAME = Object.fromEntries(
	Object.entries(CATEGORY_MAPPING).map(([name, id]) => [id, name])
);

export function selectCategory(selectedCategory, category) {
	selectedCategory.set(category.toLowerCase());
}

export function selectDifficulty(selectedDifficulty, difficulty) {
	selectedDifficulty.set(difficulty.toLowerCase());
}

export function selectQuestionCount(selectedQuestionCount, count) {
	selectedQuestionCount.set(count);
}

export async function startQuiz(
	selectedCategory,
	selectedDifficulty,
	selectedQuestionCount,
	setQuizCategory
) {
	if (!(selectedCategory && selectedDifficulty && selectedQuestionCount)) {
		throw new Error('Please select a category, difficulty level, and number of questions.');
	}

	const categoryId = CATEGORY_MAPPING[selectedCategory];
	setQuizCategory(selectedCategory);

	return {
		path: `/quiz?category=${categoryId}&difficulty=${selectedDifficulty}&questions=${selectedQuestionCount}`,
		loadingPromise: Promise.all([
			fetchQuizData(categoryId, selectedDifficulty, selectedQuestionCount),
			preloadImage(BACKGROUND_IMAGES[selectedCategory])
		])
	};
}

export async function fetchQuizData(categoryId, difficulty, count) {
	try {
		const url = new URL(QUIZ_API_BASE_URL);
		url.searchParams.append('amount', count);
		url.searchParams.append('category', categoryId);
		url.searchParams.append('difficulty', difficulty);
		url.searchParams.append('type', 'multiple');

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		questions.set(data.results);
		return data.results;
	} catch (error) {
		console.error('Failed to fetch questions:', error);
		throw error;
	}
}

export function handleAnswer(answer) {
	const currentQuestions = get(questions);
	const currentIndex = get(currentQuestionIndex);
	const currentScore = get(score);

	const isCorrect = answer === currentQuestions[currentIndex].correct_answer;
	if (isCorrect) {
		score.set(currentScore + 1);
	}

	return isCorrect;
}

// Fisher-Yates shuffle algorithm
export function shuffleArray(array) {
	const shuffled = [...array];
	let currentIndex = shuffled.length;
	let randomIndex;

	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[shuffled[currentIndex], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[currentIndex]
		];
	}

	return shuffled;
}

export function resetQuiz() {
	questions.set([]);
	currentQuestionIndex.set(0);
	score.set(0);
	selectedCategory.set(null);
	selectedDifficulty.set(null);
	selectedQuestionCount.set(null);
	selectedAnswer.set(null);
	isAnswerCorrect.set(null);
}

export function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
