import audioStore from '$lib/stores/audioStore';
import { get } from 'svelte/store';

// Create a single audio context instance for the entire application
// We declare it outside any function so it persists across function calls
let audioContext;

// This function ensures we have a valid audio context
// Browsers require audio context to be created/resumed only after user interaction
function initAudioContext() {
  // Create audio context if it doesn't exist
  if (!audioContext) {
    // WebkitAudioContext is for older browsers, particularly Safari
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Modern browsers might suspend audio context to save resources
  // We need to resume it to play sounds
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Cache to store already loaded sounds
// Using Map instead of object because it's better for storing/retrieving complex data
const audioBufferCache = new Map();

// Function to load and decode audio files
async function loadAudio(baseUrl) {
  // Check if we've already loaded this sound
  if (audioBufferCache.has(baseUrl)) {
    return audioBufferCache.get(baseUrl);
  }

  // List of audio formats to try
  const formats = ['.mp3', '.wav'];
  let audioBuffer = null;
  let lastError = null;

  // Try each format until one works
  for (const format of formats) {
    try {
      // Construct full URL for the sound file
      const url = `${baseUrl}${format}`;

      // Fetch the audio file
      const response = await fetch(url);

      // Check if fetch was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convert the audio file to a buffer
      const arrayBuffer = await response.arrayBuffer();

      // Decode the audio data
      audioBuffer = await initAudioContext().decodeAudioData(arrayBuffer);

      // Store in cache for future use
      audioBufferCache.set(baseUrl, audioBuffer);
      return audioBuffer;
    } catch (error) {
      lastError = error;
      continue; // Try next format if this one fails
    }
  }

  // If we get here, no format worked
  throw lastError || new Error('Failed to load audio in any format');
}

// Function to actually play the sound
function playAudio(buffer) {
  // Create a new source node - we need a new one for each playback
  const source = audioContext.createBufferSource();

  // Set the decoded audio data to the source
  source.buffer = buffer;

  // Connect the source to the speakers/output
  source.connect(audioContext.destination);

  // Start playing immediately (0 seconds delay)
  source.start(0);
}

// Main public function that components will use to play sounds
export async function playSoundEffect(type) {
  try {
    // Check if audio is muted
    if (get(audioStore).isMuted) {
      return; // Don't play anything if muted
    }

    // Make sure audio context is initialized
    initAudioContext();

    // Construct the base URL for the sound file
    const baseUrl = `/sounds/${type}`; // e.g., /sounds/correct

    // Load and play the sound
    const buffer = await loadAudio(baseUrl);
    playAudio(buffer);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Function to preload sounds at startup
export async function preloadSounds() {
  try {
    // List of all sound effects we want to preload
    const soundTypes = ['correct', 'incorrect', 'quizendscreen'];

    // Load all sounds in parallel
    await Promise.all(soundTypes.map((type) => loadAudio(`/sounds/${type}`)));
  } catch (error) {
    console.error('Error preloading sounds:', error);
  }
}
