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

export async function fetchQuestions(categoryId, difficulty, count) {
	loading.set(true);
	try {
		const response = await fetch(
			`https://opentdb.com/api.php?amount=${count}&category=${categoryId}&difficulty=${difficulty}&type=multiple`
		);
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

	if (answer === currentQuestions[currentIndex].correct_answer) {
		score.set(currentScore + 1);
	}
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
