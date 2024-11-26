<script>
  // SvelteKit specific imports
  import { goto } from '$app/navigation'; // For navigation
  import { onMount } from 'svelte'; // Lifecycle hook

  // UI Component imports
  import Button from '$lib/components/Button.svelte';
  import QuizTimer from '$lib/components/QuizTimer.svelte';
  import QuizQuestion from '$lib/components/QuizQuestion.svelte';
  import QuizEndScreen from '$lib/components/QuizEndScreen.svelte';
  import MuteToggle from '$lib/components/MuteToggle.svelte';

  // Quiz-specific utilities and stores
  import { ANSWER_DISPLAY_DURATION } from '$lib/utils/quizConstants';
  import { handleAnswer, resetQuiz, shuffleArray } from '$lib/utils/quizUtils';
  import { preloadSounds } from '$lib/utils/soundUtils';
  import {
    quizStore,
    updateQuizState,
    currentQuestion,
    isQuizComplete
  } from '$lib/stores/quizStore';

  // Store references and constants
  const QUESTION_TIME_LIMIT = 15; // Seconds allowed per quiz question
  let gameTimer; // Reference to the main interval timer for quiz timing

  // Quiz-related state - handles UI flow and answer management
  let quizState = $state({
    loadError: false, // Tracks API or data loading failures
    quizEnded: false, // Indicates quiz completion status
    shuffledAnswers: [], // Randomized answer options for current question
    isInitializing: true, // Controls initial loading state
    questionTime: QUESTION_TIME_LIMIT // Countdown timer value for current question (in seconds)
  });

  // Initialize quiz data and state
  // Sets up initial question data and timing mechanism
  onMount(async () => {
    try {
      if ($quizStore.questions.length > 0) {
        updateShuffledAnswers($currentQuestion);
        // Preload sounds while initializing
        await preloadSounds();
      } else {
        throw new Error('No questions available');
      }
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      quizState.loadError = true;
    } finally {
      quizState.isInitializing = false;
    }
  });

  // Timer management effect
  $effect(() => {
    if (
      !quizState.quizEnded &&
      !quizState.isInitializing &&
      !quizState.loadError &&
      $quizStore.selectedAnswer === null //  the user hasn't answered the current question yet
    ) {
      startTimer();

      return () => {
        if (gameTimer) {
          clearInterval(gameTimer);
          gameTimer = null;
        }
      };
    }
  });

  // Handles question transitions and resets timer for new questions
  $effect(() => {
    if ($currentQuestion && $quizStore.selectedAnswer === null) {
      updateShuffledAnswers($currentQuestion);
    }
  });

  // Updates document title and meta description
  $effect(() => {
    if ($quizStore.selectedCategory) {
      const category = $quizStore.selectedCategory;
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

      document.title = `${formattedCategory} Quiz | Quiz App`;
      document
        .querySelector('meta[name="description"]')
        .setAttribute(
          'content',
          `Test your knowledge in ${formattedCategory}. Take our interactive quiz and challenge yourself!`
        );
    } else {
      // Reset to default when no category is selected
      document.title = 'Quiz App - Built With Svelte';
      document
        .querySelector('meta[name="description"]')
        .setAttribute('content', 'Test your knowledge with our interactive quiz application');
    }
  });

  // Start timer function
  function startTimer() {
    // Clear any existing timer first
    if (gameTimer) {
      clearInterval(gameTimer);
    }

    // Reset question time
    quizState.questionTime = QUESTION_TIME_LIMIT;

    // Start new timer
    gameTimer = setInterval(() => {
      quizState.questionTime -= 1;

      if (quizState.questionTime === 0) {
        clearInterval(gameTimer);
        handleTimeUp();
      }
    }, 1000);
  }

  // Handles timer expiration for current question
  // Processes as incorrect answer if no selection made
  function handleTimeUp() {
    if (!$quizStore.selectedAnswer) {
      handleAnswer(null);
    }
    advanceQuiz();
  }

  // Processes user's answer selection
  // Updates score and triggers question transition after display duration
  function handleQuizAnswer(answer) {
    // Clear the timer when an answer is selected
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
    // Process the answer
    const isCorrect = answer === $currentQuestion.correct_answer;

    updateQuizState({
      selectedAnswer: answer,
      isAnswerCorrect: isCorrect,
      score: isCorrect ? $quizStore.score + 1 : $quizStore.score
    });

    // setTimeout() runs once -> advanceQuiz gets called
    setTimeout(advanceQuiz, ANSWER_DISPLAY_DURATION);
  }

  // Advances quiz to next question or ends quiz if complete
  // Resets question timer and updates quiz state
  function advanceQuiz() {
    if ($isQuizComplete) {
      quizState.quizEnded = true;
    } else {
      updateQuizState({
        selectedAnswer: null,
        isAnswerCorrect: null,
        currentQuestionIndex: $quizStore.currentQuestionIndex + 1
      });
    }
  }

  // Updates the shuffled answers array for a given question
  function updateShuffledAnswers(question) {
    if (question) {
      quizState.shuffledAnswers = shuffleArray([
        ...question.incorrect_answers,
        question.correct_answer
      ]);
    }
  }

  // Resets quiz state and redirects to home page
  // Used for both manual restarts and quiz completion
  function restartQuiz() {
    resetQuiz();
    goto('/');
  }

  // Formats category name for display
  function formatCategoryName(category) {
    if (!category) return 'Quiz';
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
</script>

<div class="animate fade-in-from-top mx-auto w-full max-w-lg text-white">
  <h1 class="mb-2 text-2xl font-bold text-yellow-300 md:mb-4 md:text-3xl">
    {formatCategoryName($quizStore.selectedCategory)} Quiz
  </h1>
  {#if !quizState.quizEnded}
    <div class="mb-4 flex justify-end">
      <MuteToggle />
    </div>
  {/if}

  {#if quizState.isInitializing}
    <!-- Show nothing during initialization -->
  {:else if quizState.loadError}
    <div class="text-center">
      <p class="mb-4 text-red-500">Failed to load questions. Please try again.</p>
      <Button
        onclick={restartQuiz}
        variant="primary"
        customClass="w-32 bg-red-500 hover:bg-red-600 border-red-500"
        text="Go Back"
      />
    </div>
  {:else if quizState.quizEnded}
    <div class="space-y-4">
      <QuizEndScreen onrestart={restartQuiz} />
    </div>
  {:else if $currentQuestion && $quizStore.questions.length > 0}
    <div class="mb-6 flex items-center justify-between text-base">
      <h2>
        Question: <span class="inline-flex w-12 justify-end"
          >{$quizStore.currentQuestionIndex + 1} / {$quizStore.questions.length}</span
        >
      </h2>
      <p>
        Time remaining:
        <span class="inline-flex w-7 justify-end"> {quizState.questionTime}s</span>
      </p>
    </div>

    <QuizTimer timeLimit={QUESTION_TIME_LIMIT} currentTime={quizState.questionTime} />

    <QuizQuestion
      question={$currentQuestion.question}
      shuffledAnswers={quizState.shuffledAnswers}
      selectedAnswer={$quizStore.selectedAnswer}
      isAnswerCorrect={$quizStore.isAnswerCorrect}
      onAnswerSelect={handleQuizAnswer}
    />

    <div class="animate fade-in-from-top mt-8 flex flex-col gap-4">
      <p>
        Score: <span class="inline-flex w-4 justify-end">{$quizStore.score}</span> /
        <span class="inline-flex {$quizStore.questions.length >= 10 ? 'w-4' : 'w-3'} justify-end">
          {$quizStore.questions.length}
        </span>
      </p>
      <Button
        onclick={restartQuiz}
        variant="primary"
        customClass="w-32 font-semibold bg-red-500 hover:bg-red-600 border-red-500 mx-auto my-4"
        text="Restart"
      />
    </div>
  {/if}
</div>
