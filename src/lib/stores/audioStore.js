// src/lib/stores/audioStore.js
import { writable } from 'svelte/store';

// Get initial mute state from localStorage if available
const storedMute = localStorage.getItem('quizAppMuted');
const initialMute = storedMute ? JSON.parse(storedMute) : false;

// Create the store
const audioStore = writable({
  isMuted: initialMute
});

// Create a convenience function to toggle mute
export function toggleMute() {
  audioStore.update((state) => {
    const newState = { ...state, isMuted: !state.isMuted };
    // Save to localStorage
    localStorage.setItem('quizAppMuted', JSON.stringify(newState.isMuted));
    return newState;
  });
}

export default audioStore;
