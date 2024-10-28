// Game variables
let currentWord = {}; // Object to store the current word
let score = 0; // Variable to store the player’s score
let totalQuestions = 0; // Variable to count total questions answered
let isEnglishToVietnamese = true; // Flag to check if the translation direction is English to Vietnamese
let isAnswerSelected = false; // Flag to check if an answer has been selected
let words = []; // Array to store words fetched from the API
const musicTracks = [
  "assets/lofi/lofi1.mp3",
  "assets/lofi/lofi2.mp3",
  "assets/lofi/lofi3.mp3",
  "assets/lofi/lofi4.mp3",
  "assets/lofi/lofi5.mp3",
]; // Array of music tracks to be used as background music
let currentTrack = new Audio(); // Creates an audio object for background music
let clickSound = new Audio("./assets/sound/click.mp3"); // Audio object for click sound
let clapSound = new Audio("./assets/sound/clap.mp3"); // Audio object for clap sound
let correctSound = new Audio("./assets/sound/nice.mp3"); // Audio object for correct answer sound
let wrongSound = new Audio("./assets/sound/wrong.mp3"); // Audio object for wrong answer sound

const requiredScore = 10; // Score required to win the game
const requiredQuestions = 20; // Number of questions required to finish the game

// Function to start the game
function startGame() {
  document.getElementById("startBtn").style.display = "none"; // Hide start button
  document.getElementById("footer").style.display = "none";
  document.getElementById("goal-message").style.display = "none"; // Hide message
  document.getElementById("all").style.display = "block"; // Show game elements
  fetchWords(); // Fetch words from the API
  playRandomMusic(); // Play random background music
}

// Function to play random music
function playRandomMusic() {
  const randomIndex = Math.floor(Math.random() * musicTracks.length);
  currentTrack.src = musicTracks[randomIndex]; // Set a random track as the source
  currentTrack.loop = true; // Loop the background music
  currentTrack.play(); // Start playing the track

  // When the track ends, play a new random track if the game isn't over
  currentTrack.onended = function () {
    if (!isGameEnded()) {
      playRandomMusic(); // Play a new random track
    }
  };
}

// Check if the game has ended
function isGameEnded() {
  return totalQuestions >= requiredQuestions || score >= requiredScore; // Returns true if game-ending conditions are met
}

// Function to fetch words from an API
async function fetchWords() {
  toggleLoading(true); // Show loading indicator
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyot-ZqrUYe7ASyHACQsQw68-Z6ZoCAqq9k7XbH3d00ZufXAKphei4GkWUrF1WhaOcs/exec"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    words = data; // Assign fetched data to words array
    selectRandomWord(); // Start the game with the first word
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  } finally {
    toggleLoading(false); // Hide loading indicator
  }
}

// Show or hide the loading indicator
function toggleLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
  document.getElementById("all").style.display = show ? "none" : "block";
  document.getElementById("title").style.display = show ? "none" : "block";
  const gameContainer = document.querySelector(".game-container");
  gameContainer.style.display = show ? "none" : "block";
}

// Function to select a random word from the list
function selectRandomWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  updateWordDisplay();
  generateAnswerButtons();
  isAnswerSelected = false;
}

// Function to update the displayed word based on the current language mode
function updateWordDisplay() {
  document.getElementById("wordDisplay").textContent = isEnglishToVietnamese
    ? currentWord.en
    : currentWord.vi;
}

// Generate answer buttons with random options
function generateAnswerButtons() {
  const answerButtons = ["A", "B", "C", "D"];
  let answerOptions = [...words].sort(() => Math.random() - 0.5).slice(0, 4);
  if (!answerOptions.includes(currentWord)) {
    answerOptions[Math.floor(Math.random() * 4)] = currentWord;
  }

  answerButtons.forEach((label, index) => {
    const btn = document.getElementById(`answer${label}`);
    btn.textContent = `${label}: ${
      isEnglishToVietnamese ? answerOptions[index].vi : answerOptions[index].en
    }`;
    btn.onclick = () => handleAnswer(answerOptions[index], btn);
    btn.classList.remove("correct", "wrong", "selected");
  });
}

// Handle answer selection
function handleAnswer(selectedAnswer, userButton) {
  if (isAnswerSelected) return;

  clickSound.play(); // Play click sound
  isAnswerSelected = true;

  const correctAnswer = isEnglishToVietnamese ? currentWord.vi : currentWord.en;
  const buttons = document.querySelectorAll(".answer-btn");
  userButton.classList.add("selected");

  // Disable all answer buttons
  buttons.forEach((button) => {
    if (button !== userButton) {
      button.disabled = true;
      button.classList.add("disabled");
    }
  });

  setTimeout(() => {
    if (selectedAnswer[isEnglishToVietnamese ? "vi" : "en"] === correctAnswer) {
      userButton.classList.add("correct");
      score++;
      totalQuestions++;
      updateScoreDisplay();
      correctSound.play(); // Play correct answer sound
    } else {
      userButton.classList.add("wrong");
      wrongSound.play(); // Play incorrect answer sound
      buttons.forEach((button) => {
        if (button.textContent.includes(correctAnswer)) {
          button.classList.add("correct");
        }
      });
    }

    setTimeout(() => {
      buttons.forEach((button) => {
        button.disabled = false;
        button.classList.remove("disabled", "wrong", "correct", "selected");
      });
    }, 2000);

    if (score >= requiredScore) {
      document.getElementById("statusGif").src = "./assets/true.gif";
      document.getElementById("statusGifContainer").classList.add("show");
      setTimeout(() => {
        document.getElementById("statusGifContainer").classList.remove("show");
      }, 2000);
    }

    if (totalQuestions >= requiredQuestions) {
      endGame();
    } else {
      setTimeout(selectRandomWord, 3000);
    }
  }, 3000);
}

// Toggle between English-Vietnamese mode
function toggleLanguage() {
  isEnglishToVietnamese = !isEnglishToVietnamese;
  updateWordDisplay();
  generateAnswerButtons();
}

// Update score display
function updateScoreDisplay() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

// Function to end the game
function endGame() {
  currentTrack.pause();
  currentTrack.currentTime = 0;
  clapSound.play();
  displayGameElements(false);
  document.getElementById("statusGif").src = "./assets/end.gif";
  document.getElementById("statusGifContainer").classList.add("show");
  document.getElementById("playAgainBtn").style.display = "block";
}

// Show or hide game elements
function displayGameElements(show) {
  document.getElementById("wordDisplay").style.display = show
    ? "block"
    : "none";
  document
    .querySelectorAll(".answer-btn")
    .forEach((btn) => (btn.style.display = show ? "inline-block" : "none"));
  document.getElementById("btn").style.display = show ? "inline-block" : "none";
}

// Reset the game to initial state
function resetGame() {
  score = 0;
  totalQuestions = 0;
  isAnswerSelected = false;
  isEnglishToVietnamese = true;
  updateScoreDisplay();
  document.getElementById("statusGif").src = "./assets/start.gif";
  document.getElementById("statusGifContainer").classList.remove("show");
  document.getElementById("playAgainBtn").style.display = "none";

  displayGameElements(true);
  selectRandomWord();
  playRandomMusic();
}
