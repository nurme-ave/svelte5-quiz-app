import { writable } from 'svelte/store';

// Create the store with a default value
const audioStore = writable({
  isMuted: false
});

// Initialize the store with localStorage value if we're in the browser
if (typeof window !== 'undefined') {
  const storedMute = localStorage.getItem('quizAppMuted');
  if (storedMute !== null) {
    audioStore.set({ isMuted: JSON.parse(storedMute) });
  }
}

// Create a convenience function to toggle mute
export function toggleMute() {
  audioStore.update((state) => {
    const newState = { ...state, isMuted: !state.isMuted };
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizAppMuted', JSON.stringify(newState.isMuted));
    }
    return newState;
  });
}

export default audioStore;