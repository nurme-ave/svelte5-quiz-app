import { writable } from 'svelte/store';

// Quiz settings/state stores
export const questions = writable([]);
export const currentQuestionIndex = writable(0);
export const score = writable(0);
export const loading = writable(true);
export const selectedCategory = writable(null);
export const selectedDifficulty = writable(null);
export const selectedQuestionCount = writable(null);
export const selectedAnswer = writable(null);
export const isAnswerCorrect = writable(null);

export const setQuizCategory = (category) => {
	selectedCategory.set(category);
};
