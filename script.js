// Game variables
let currentWord = {};
let score = 0;
let totalQuestions = 0;
let isEnglishToVietnamese = true;
let isAnswerSelected = false;
let words = [];

// Function to start the game
function startGame() {
  document.getElementById("startBtn").style.display = "none"; // Ẩn nút Bắt đầu
  document.getElementById("goal-message").style.display = "none"; // hide info
  document.getElementById("all").style.display = "block"; // Hiện các phần của trò chơi
  fetchWords(); // Tải từ từ API
}

// Function to fetch words from API
async function fetchWords() {
  toggleLoading(true);
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyot-ZqrUYe7ASyHACQsQw68-Z6ZoCAqq9k7XbH3d00ZufXAKphei4GkWUrF1WhaOcs/exec"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    words = data; // Gán dữ liệu từ API cho words
    selectRandomWord(); // Bắt đầu trò chơi sau khi dữ liệu được tải
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  } finally {
    toggleLoading(false); // Ẩn biểu tượng loading
  }
}

// Function to show or hide the loading indicator
function toggleLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
  document.getElementById("all").style.display = show ? "none" : "block";
  document.getElementById("title").style.display = show ? "none" : "block";
}

// Function to select a random word
function selectRandomWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  updateWordDisplay();
  generateAnswerButtons();
  isAnswerSelected = false;
}

// Function to update the displayed word
function updateWordDisplay() {
  document.getElementById("wordDisplay").textContent = isEnglishToVietnamese
    ? currentWord.en
    : currentWord.vi;
}

// Function to generate answer buttons with random options
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

// Function to handle answer selection
function handleAnswer(selectedAnswer, userButton) {
  if (isAnswerSelected) return;
  isAnswerSelected = true;

  const correctAnswer = isEnglishToVietnamese ? currentWord.vi : currentWord.en;
  const buttons = document.querySelectorAll(".answer-btn");
  userButton.classList.add("selected");

  setTimeout(() => {
    // Check answer correctness
    if (selectedAnswer[isEnglishToVietnamese ? "vi" : "en"] === correctAnswer) {
      userButton.classList.add("correct");
      score++;
      totalQuestions++;
      updateScoreDisplay();

      setTimeout(
        () => userButton.classList.remove("correct", "selected"),
        2000
      );
    } else {
      userButton.classList.add("wrong");
      buttons.forEach((button) => {
        if (button.textContent.includes(correctAnswer)) {
          button.classList.add("correct");
        }
      });
    }

    if (totalQuestions >= 2 || score >= 2) endGame();
    else setTimeout(selectRandomWord, 3000);
  }, 3000);
}

// Function to toggle language mode
function toggleLanguage() {
  isEnglishToVietnamese = !isEnglishToVietnamese;
  updateWordDisplay();
  generateAnswerButtons();
}

// Function to update score display
function updateScoreDisplay() {
  document.getElementById("score").textContent = `Điểm: ${score}`;
}

// Function to end the game
function endGame() {
  displayGameElements(false);
  document.getElementById("statusGif").src =
    score >= 2 ? "./assets/end.gif" : "./assets/true.gif";
  document.getElementById("statusGifContainer").classList.add("show");
  document.getElementById("playAgainBtn").style.display = "block";
}

// Function to display or hide game elements
function displayGameElements(show) {
  document.getElementById("wordDisplay").style.display = show
    ? "block"
    : "none";
  document
    .querySelectorAll(".answer-btn")
    .forEach((btn) => (btn.style.display = show ? "inline-block" : "none"));
  document.getElementById("btn").style.display = show ? "inline-block" : "none";
}

// Function to reset the game
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
}
