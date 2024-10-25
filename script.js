// Game variables
let currentWord = {};
let score = 0;
let totalQuestions = 0;
let isEnglishToVietnamese = true;
let isAnswerSelected = false;
let words = [];
const musicTracks = ["assets/lofi/lofi2.mp3", "assets/lofi/lofi3.mp3"];
let currentTrack = new Audio(); // Tạo đối tượng âm thanh
let clickSound = new Audio("./assets/sound/click.mp3"); // Tạo đối tượng âm thanh click
let clapSound = new Audio("./assets/sound/clap.mp3"); // Tạo đối tượng âm thanh clap
let correctSound = new Audio("./assets/sound/nice.mp3"); // Tạo đối tượng âm thanh correct
let wrongSound = new Audio("./assets/sound/wrong.mp3"); // Tạo đối tượng âm thanh wrong

const requiredScore = 2; // Biến cho điểm yêu cầu
const requiredQuestions = 2; // Biến cho số câu hỏi yêu cầu

// Function to start the game
function startGame() {
  document.getElementById("startBtn").style.display = "none"; // Ẩn nút Bắt đầu
  document.getElementById("footer").style.display = "none";
  document.getElementById("goal-message").style.display = "none"; // Ẩn thông tin
  document.getElementById("all").style.display = "block"; // Hiện các phần của trò chơi
  fetchWords(); // Tải từ từ API

  playRandomMusic(); // Phát nhạc ngẫu nhiên khi bắt đầu trò chơi
}

// Hàm phát nhạc ngẫu nhiên
function playRandomMusic() {
  const randomIndex = Math.floor(Math.random() * musicTracks.length);
  currentTrack.src = musicTracks[randomIndex]; // Chọn bài nhạc ngẫu nhiên
  currentTrack.loop = true; // Lặp lại nhạc nền
  currentTrack.play(); // Phát bài nhạc

  // Khi bài nhạc kết thúc, phát bài nhạc tiếp theo (nếu game chưa kết thúc)
  currentTrack.onended = function () {
    if (!isGameEnded()) {
      playRandomMusic(); // Phát bài nhạc ngẫu nhiên tiếp theo
    }
  };
}

function isGameEnded() {
  return totalQuestions >= requiredQuestions || score >= requiredScore; // Thay đổi logic này tùy theo yêu cầu của bạn
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
// Function to handle answer selection
// Function to handle answer selection
// Function to handle answer selection
function handleAnswer(selectedAnswer, userButton) {
  if (isAnswerSelected) return;

  clickSound.play(); // Phát âm thanh click

  isAnswerSelected = true;

  const correctAnswer = isEnglishToVietnamese ? currentWord.vi : currentWord.en;
  const buttons = document.querySelectorAll(".answer-btn");
  userButton.classList.add("selected");

  // Vô hiệu hóa tất cả các nút đáp án
  buttons.forEach((button) => {
    if (button !== userButton) {
      button.disabled = true; // Vô hiệu hóa nút
      button.classList.add("disabled"); // Thêm lớp disabled để làm sẫm màu
    }
  });

  setTimeout(() => {
    // Check answer correctness
    if (selectedAnswer[isEnglishToVietnamese ? "vi" : "en"] === correctAnswer) {
      userButton.classList.add("correct");
      score++;
      totalQuestions++;
      updateScoreDisplay();
      correctSound.play(); // Phát âm thanh đúng

      setTimeout(() => {
        userButton.classList.remove("correct", "selected");
      }, 2000);
    } else {
      userButton.classList.add("wrong");
      wrongSound.play(); // Phát âm thanh sai
      buttons.forEach((button) => {
        if (button.textContent.includes(correctAnswer)) {
          button.classList.add("correct");
        }
      });
    }

    // Khôi phục trạng thái của các nút sau 2 giây
    setTimeout(() => {
      buttons.forEach((button) => {
        button.disabled = false; // Bật lại nút
        button.classList.remove("disabled"); // Bỏ lớp disabled để phục hồi màu sắc
        button.classList.remove("wrong"); // Bỏ lớp wrong nếu có
        button.classList.remove("correct"); // Bỏ lớp correct nếu có
        button.classList.remove("selected"); // Bỏ lớp selected nếu có
      });
    }, 2000);

    if (totalQuestions >= requiredQuestions || score >= requiredScore) {
      endGame();
    } else {
      setTimeout(selectRandomWord, 3000);
    }
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
  currentTrack.pause(); // Dừng nhạc
  currentTrack.currentTime = 0; // Đặt lại thời gian hiện tại về 0
  clapSound.play(); // Phát âm thanh vỗ tay
  displayGameElements(false);
  document.getElementById("statusGif").src =
    score >= requiredScore ? "./assets/end.gif" : "./assets/true.gif";
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
  playRandomMusic(); // Gọi hàm phát nhạc
}
