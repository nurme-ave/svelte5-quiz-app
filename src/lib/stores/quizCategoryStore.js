import { writable } from 'svelte/store';

export const quizCategory = writable(null);

export const setQuizCategory = (category) => {
	quizCategory.set(category);
};

export const getQuizBackgroundImage = (category) => {
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
};
