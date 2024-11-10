<script>
  import audioStore, { toggleMute } from '$lib/stores/audioStore';
</script>

<div class="flex items-center gap-2 md:gap-3">
  Sound Effects:
  <button
    onclick={toggleMute}
    class="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 hover:bg-white/20 transition-colors duration-200"
    aria-label={$audioStore.isMuted ? 'Unmute sound' : 'Mute sound'}
  >
    {#if $audioStore.isMuted}
      <i class="fas fa-volume-mute text-white"></i>
    {:else}
      <i class="fas fa-volume-up text-white"></i>
    {/if}
  </button>
</div>
