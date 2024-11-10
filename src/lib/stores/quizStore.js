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

// Gets the current question based on the index
export const currentQuestion = derived(
  quizStore,
  ($store) => $store.questions[$store.currentQuestionIndex] || null
);

// Checks if we're on the last question
export const isQuizComplete = derived(
  quizStore,
  ($store) => $store.currentQuestionIndex >= $store.questions.length - 1
);

// Calculates the score as a percentage
export const scorePercentage = derived(quizStore, ($store) => {
  if ($store.questions.length === 0) return 0;
  return ($store.score / $store.questions.length) * 100;
});

// Checks if all required selections are made to start the quiz
export const canStartQuiz = derived(
  quizStore,
  ($store) =>
    !!$store.selectedCategory && !!$store.selectedDifficulty && !!$store.selectedQuestionCount
);

// Generic update function
export function updateQuizState(updates) {
  quizStore.update((state) => ({ ...state, ...updates }));
}

// Specific category update function
export function setQuizCategory(category) {
  updateQuizState({ selectedCategory: category });
}

// Reset everything to initial state
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
