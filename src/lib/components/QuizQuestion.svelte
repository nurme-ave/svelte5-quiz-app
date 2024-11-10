<script>
  import { quizStore } from '$lib/stores/quizStore';
  import { playSoundEffect } from '$lib/utils/soundUtils';
  import { currentQuestion } from '$lib/stores/quizStore';

  let { question, shuffledAnswers = [], onAnswerSelect = () => {} } = $props();

  function getAnswerButtonClasses(answer) {
    const baseClasses = 'w-full px-2 py-4 md:py-3.5 rounded-md transition-colors duration-200';

    if (!$quizStore.selectedAnswer) {
      return `${baseClasses} bg-white text-black hover:bg-blue-500 hover:text-white`;
    }

    if ($quizStore.selectedAnswer === answer) {
      return $quizStore.isAnswerCorrect
        ? `${baseClasses} bg-green-500 text-white`
        : `${baseClasses} bg-red-500 text-white`;
    }

    return `${baseClasses} bg-white text-black`;
  }

  async function handleAnswerSelection(answer) {
    try {
      const isCorrect = answer === $currentQuestion.correct_answer;
      await playSoundEffect(isCorrect ? 'correct' : 'incorrect');
      onAnswerSelect(answer);
    } catch (error) {
      // If sound fails, still process the answer
      onAnswerSelect(answer);
    }
  }
</script>

<div class="w-full">
  <div class="mb-8 flex h-[5rem] w-full items-center justify-center px-4 sm:h-[4rem] lg:h-[3.5rem]">
    <!-- @html directive safely converts and renders HTML strings, including HTML entities.  -->
    <p class="text-center">{@html question}</p>
  </div>

  <div class="grid w-full gap-2">
    {#each shuffledAnswers as answer (answer)}
      <button
        class={getAnswerButtonClasses(answer)}
        disabled={$quizStore.selectedAnswer !== null}
        onclick={() => handleAnswerSelection(answer)}
        aria-pressed={$quizStore.selectedAnswer === answer}
        aria-disabled={$quizStore.selectedAnswer !== null}
      >
        {@html answer}
      </button>
    {/each}
  </div>
</div>
