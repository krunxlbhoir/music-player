// Playlist - replace src/img with your files in assets/ or remote URLs
const songs = [
  {
    title: "Mi Amor",
    author: "Sharn, The Paul",
    src: "assets/songs/Mi Amor - Sharn [128 Kbps]-(SongsPk.com.se).mp3",
    img: "assets/cover/Mi Amor.jpg",
  },
  {
    title: "Summer High",
    author: "AP Dhillon",
    src: "assets/songs/Summer High - AP Dhillon.mp3",
    img: "assets/cover/summer-high-ap-dhillon.webp",
  },
  {
    title: "Born to Shine",
    author: "Diljit Dosanjh",
    src: "assets/songs/Born_To_Shine_1.mp3",
    img: "assets/cover/Born-To-Shine-1.jpg",
  },
  {
    title: "Pehli Nazar Mein",
    author: "Atif Aslam, Pritam",
    src: "assets/songs/Pehli Nazar Mein [128 Kbps]-(SongsPk.com.se).mp3",
    img: "assets/cover/Pehli nazae mei.jpg",
  },
  {
    title: "Jaan 'Nisaar",
    author: "Amit Trivedi, Arjit Singh",
    src: "assets/songs/Jaan Nisaar - Lyrical  Kedarnath Arijit Singh  Sushant Singh Rajput  Sara Ali Khan Amit Trivedi - Zee Music Company.mp3",
    img: "assets/cover/jaan nisaar.jpg",
  },
  // Add more songs as needed
];

let currentIndex = 0;
// Use the audio element from the HTML
const audio = document.getElementById("audio-source"); 

// SVG path data for icons
const ICON_PLAY = 'M6 4.5v15L18 12 6 4.5z';
const ICON_PAUSE = 'M6 19h4V5H6v14zM14 5v14h4V5h-4z';

// DOM elements
const coverEl = document.getElementById("cover");
const titleEl = document.getElementById("title");
const authorEl = document.getElementById("author");
const playBtn = document.getElementById("play");
const playIconPath = document.getElementById("playIconPath");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progressEl = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const songIndexEl = document.getElementById("songIndex");

// helper: format seconds -> m:ss
function formatTime(sec){
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

// helper: update play/pause button state
function updatePlayButtonState(isPlaying) {
  playIconPath.setAttribute('d', isPlaying ? ICON_PAUSE : ICON_PLAY);
  playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

// load a song by index
function loadSong(i){
  const s = songs[i];
  
  // Set song source and metadata
  audio.src = s.src;
  coverEl.src = s.img || "assets/cover1.jpg";
  coverEl.alt = `${s.title} album cover`;
  titleEl.textContent = s.title;
  authorEl.textContent = s.author;
  songIndexEl.textContent = `${i + 1} / ${songs.length}`;

  // Reset progress and time displays
  progressEl.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  
  // Update button visual state to 'play' (paused)
  updatePlayButtonState(false);
  
  // Load the new audio source
  audio.load();
}

// play or pause toggle
function togglePlay(){
  if(audio.paused){
    // Use a try...catch for the Promise returned by audio.play()
    // to handle cases where autoplay is blocked by the browser.
    audio.play()
      .then(() => {
        updatePlayButtonState(true);
      })
      .catch(err => {
        console.error("Autoplay prevented by browser:", err);
        // Optionally show a message to the user: "Click to play"
      });
  } else {
    audio.pause();
    updatePlayButtonState(false);
  }
}

// prev & next logic
function changeSong(direction){
  currentIndex = (currentIndex + direction + songs.length) % songs.length;
  loadSong(currentIndex);
  
  // Attempt to play automatically after changing the song
  audio.play()
    .then(() => updatePlayButtonState(true))
    .catch(err => console.error("Autoplay prevented after song change:", err));
}
const prevSong = () => changeSong(-1);
const nextSong = () => changeSong(1);

// Update UI elements related to time and progress
function updateTimeUI() {
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  
  // Update progress bar
  progressEl.value = percent;
  // Update input background to show progress color (for cross-browser style)
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  progressEl.style.background = `linear-gradient(90deg, ${accent} ${percent}%, #ddd ${percent}%)`;
  
  // Update time displays
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

// Event Listeners

// Fired when the audio has loaded enough data to determine duration
audio.addEventListener("loadeddata", () => {
    // Only set duration if it's available and not already set from metadata
    if (audio.duration && durationEl.textContent === "0:00") {
        durationEl.textContent = formatTime(audio.duration);
    }
});

// Update progress bar as audio plays
audio.addEventListener("timeupdate", updateTimeUI);

// Update play button state when pause/play events occur outside of togglePlay (e.g., audio ends)
audio.addEventListener('play', () => updatePlayButtonState(true));
audio.addEventListener('pause', () => updatePlayButtonState(false));

// Seek when user interacts with range input (input covers drag)
progressEl.addEventListener("input", (e) => {
  if (!audio.duration) return;
  const percent = Number(e.target.value);
  audio.currentTime = (percent / 100) * audio.duration;
  
  // Update current time display immediately while seeking
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

// when song ends — advance to next
audio.addEventListener("ended", () => {
  nextSong();
});

// keyboard shortcuts (space = play/pause)
document.addEventListener("keydown", (e) => {
  // Check if spacebar is pressed AND the focus is NOT on a text input or the progress range
  const isInput = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
  
  if (e.code === "Space" && !isInput) {
    e.preventDefault();
    togglePlay();
  }
});

// button listeners
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);

// initial load
loadSong(currentIndex);

// Optional: When page is hidden, pause to save resources
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && !audio.paused) {
    audio.pause();
    // updatePlayButtonState(false) is handled by the 'pause' event listener now
  }
});