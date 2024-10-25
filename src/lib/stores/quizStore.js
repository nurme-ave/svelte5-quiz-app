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

// Helper functions
export const quizCategory = selectedCategory;
export const setQuizCategory = (category) => {
	selectedCategory.set(category);
};

export function getQuizBackgroundImage(category) {
	switch (category) {
		case 'film':
			return '/images/bkg_film.jpg';
		case 'geography':
			return '/images/bkg_geography.jpg';
		case 'history':
			return '/images/bkg_history.jpg';
		case 'music':
			return '/images/bkg_music.png';
		case 'sports':
			return '/images/bkg_sports.jpg';
		case 'vehicles':
			return '/images/bkg_vehicles.jpg';
		default:
			return '/images/bkg_main.jpg';
	}
}
