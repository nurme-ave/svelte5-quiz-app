import { get } from 'svelte/store';

import { quizStore, updateQuizState } from '../stores/quizStore';
import { preloadImage } from './imagePreloader';
import { CATEGORY_MAPPING, BACKGROUND_IMAGES } from './quizConstants';

export const QUIZ_API_BASE_URL = 'https://opentdb.com/api.php';

// Reverse mapping
export const CATEGORY_ID_TO_NAME = Object.fromEntries(
  Object.entries(CATEGORY_MAPPING).map(([name, id]) => [id, name])
);

export function startQuiz(category, difficulty, questionCount) {
  if (!(category && difficulty && questionCount)) {
    throw new Error('Please select a category, difficulty level, and number of questions.');
  }

  const categoryId = CATEGORY_MAPPING[category];

  return {
    path: `/quiz?category=${categoryId}&difficulty=${difficulty}&questions=${questionCount}`,
    loadingPromise: Promise.all([
      fetchQuizData(categoryId, difficulty, questionCount),
      preloadImage(BACKGROUND_IMAGES[category])
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
    updateQuizState({ questions: data.results });
    return data.results;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
}

export function handleAnswer(answer) {
  const state = get(quizStore);
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = answer === currentQuestion?.correct_answer;

  if (isCorrect) {
    updateQuizState({ score: state.score + 1 });
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
  updateQuizState({
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

export function getQuizBackgroundImage(category) {
  return BACKGROUND_IMAGES[category] || BACKGROUND_IMAGES.default;
}
