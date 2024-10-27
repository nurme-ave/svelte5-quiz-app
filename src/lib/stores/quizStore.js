import { writable, derived } from 'svelte/store';

export const quizStore = writable({
	questions: [],
	currentQuestionIndex: 0,
	score: 0,
	loading: true,
	selectedCategory: null,
	selectedDifficulty: null,
	selectedQuestionCount: null,
	selectedAnswer: null,
	isAnswerCorrect: null
});

// Derived stores for computed values
export const currentQuestion = derived(
	quizStore,
	($store) => $store.questions[$store.currentQuestionIndex] || null
);

export const isQuizComplete = derived(
	quizStore,
	($store) => $store.currentQuestionIndex >= $store.questions.length - 1
);

export const scorePercentage = derived(quizStore, ($store) => {
	if ($store.questions.length === 0) return 0;
	return ($store.score / $store.questions.length) * 100;
});

export const canStartQuiz = derived(
	quizStore,
	($store) =>
		!!$store.selectedCategory && !!$store.selectedDifficulty && !!$store.selectedQuestionCount
);

// Helper functions to update specific parts of the store
export function updateQuizState(updates) {
	quizStore.update((state) => ({ ...state, ...updates }));
}

export function setQuizCategory(category) {
	updateQuizState({ selectedCategory: category });
}

export function resetQuiz() {
	quizStore.set({
		questions: [],
		currentQuestionIndex: 0,
		score: 0,
		loading: true,
		selectedCategory: null,
		selectedDifficulty: null,
		selectedQuestionCount: null,
		selectedAnswer: null,
		isAnswerCorrect: null
	});
}
