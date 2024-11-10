<script>
  let { timeLimit, currentTime } = $props();

  let progressPercentage = $derived((currentTime / timeLimit) * 100);

  function getProgressBarColor(percentage) {
    if (percentage <= 33.34) return 'bg-red-500';
    if (percentage <= 66.66) return 'bg-yellow-500';
    return 'bg-green-500';
  }
</script>

<div class="mb-6 h-3 w-full overflow-hidden rounded-full bg-white">
  <div
    class="h-full {getProgressBarColor(progressPercentage)} origin-left"
    style="width: {progressPercentage}%; transition: width {currentTime === timeLimit
      ? '0s'
      : '1s'} linear"
  ></div>
</div>

<!--
  'origin-left' is a Tailwind CSS utility class that sets the transform-origin property to the left side of the element. The transform-origin property establishes the point around which a transformation is applied.
  
  'origin-left' ensures that when the width of the progress bar changes (which is essentially a transform), the animation/transition happens from the left side of the container. 
-->
