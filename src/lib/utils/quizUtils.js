import { get } from 'svelte/store';

import {
	questions,
	currentQuestionIndex,
	score,
	loading,
	selectedCategory,
	selectedDifficulty,
	selectedQuestionCount,
	selectedAnswer,
	isAnswerCorrect
} from '../stores/quizStore';

export const QUIZ_API_BASE_URL = 'https://opentdb.com/api.php';

export const CATEGORY_MAPPING = {
	film: 11,
	music: 12,
	sports: 21,
	geography: 22,
	history: 23,
	vehicles: 28
};

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

export function startQuiz(
	selectedCategory,
	selectedDifficulty,
	selectedQuestionCount,
	setQuizCategory
) {
	if (selectedCategory && selectedDifficulty && selectedQuestionCount) {
		const categoryId = CATEGORY_MAPPING[selectedCategory];
		setQuizCategory(selectedCategory);
		return `/quiz?category=${categoryId}&difficulty=${selectedDifficulty}&questions=${selectedQuestionCount}`;
	} else {
		throw new Error('Please select a category, difficulty level, and number of questions.');
	}
}

export async function fetchQuestions(categoryId, difficulty, count) {
	loading.set(true);
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
	} catch (error) {
		console.error('Failed to fetch questions:', error);
		throw error;
	} finally {
		loading.set(false);
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
	loading.set(true);
	selectedCategory.set(null);
	selectedDifficulty.set(null);
	selectedQuestionCount.set(null);
	selectedAnswer.set(null);
	isAnswerCorrect.set(null);
}
