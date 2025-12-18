class WordGuessingGame {
  constructor() {
    this.words = [];
    this.currentWord = null;
    this.currentHint = null;
    this.guessesLeft = 6;
    this.score = 0;
    this.gameActive = true;
    this.guessedWords = [];
    this.letterBoxes = [];

    this.initElements();
    this.loadWords();
    this.attachEventListeners();
  }

  initElements() {
    this.letterBoxesContainer = document.getElementById("letterBoxes");
    this.submitBtn = document.getElementById("submitBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.hintText = document.getElementById("hintText");
    this.guessesLeftDisplay = document.getElementById("guessesLeft");
    this.scoreDisplay = document.getElementById("score");
    this.messageEl = document.getElementById("message");
    this.gameOverEl = document.getElementById("gameOver");
    this.gameOverTitle = document.getElementById("gameOverTitle");
    this.gameOverWord = document.getElementById("gameOverWord");
    this.guessForm = document.getElementById("guessForm");
  }

  attachEventListeners() {
    this.guessForm.addEventListener("submit", (e) => this.handleGuess(e));
    this.resetBtn.addEventListener("click", () => this.resetGame());
  }

  loadWords() {
    fetch("words.json")
      .then((response) => response.json())
      .then((data) => {
        this.words = data.words;
        this.startNewRound();
      })
      .catch((error) => {
        console.error("Error loading words:", error);
        this.showMessage("Error loading game data", "error");
      });
  }

  createLetterBoxes(wordLength) {
    this.letterBoxesContainer.innerHTML = "";
    this.letterBoxes = [];

    for (let i = 0; i < wordLength; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "letter-box";
      input.maxLength = "1";
      input.disabled = false;
      input.dataset.index = i;
      input.autocomplete = "off";

      input.addEventListener("input", (e) => this.handleLetterInput(e, i));
      input.addEventListener("keydown", (e) => this.handleKeyDown(e, i));

      this.letterBoxesContainer.appendChild(input);
      this.letterBoxes.push(input);
    }

    if (this.letterBoxes.length > 0) {
      this.letterBoxes[0].focus();
    }
  }

  handleLetterInput(e, index) {
    const input = e.target;
    const value = input.value.toUpperCase();

    if (value) {
      input.value = value;
      // Move to next box
      if (index < this.letterBoxes.length - 1) {
        this.letterBoxes[index + 1].focus();
      }
    }
  }

  handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const input = this.letterBoxes[index];
      input.value = "";

      // Move to previous box on backspace
      if (index > 0) {
        this.letterBoxes[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) {
        this.letterBoxes[index - 1].focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < this.letterBoxes.length - 1) {
        this.letterBoxes[index + 1].focus();
      }
    }
  }

  startNewRound() {
    if (this.words.length === 0) {
      this.showMessage("No words available", "error");
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.words.length);
    const selectedWord = this.words[randomIndex];

    this.currentWord = selectedWord.word.toLowerCase();
    this.currentHint = selectedWord.hint;
    this.guessesLeft = 6;
    this.gameActive = true;
    this.guessedWords = [];

    this.hintText.textContent = this.currentHint;
    this.createLetterBoxes(this.currentWord.length);
    this.updateDisplay();
    this.clearMessage();
    this.submitBtn.disabled = false;
    this.enableLetterBoxes();
    this.gameOverEl.classList.remove("show");

    if (this.letterBoxes.length > 0) {
      this.letterBoxes[0].focus();
    }
  }

  handleGuess(e) {
    e.preventDefault();

    if (!this.gameActive) {
      return;
    }

    const guess = this.letterBoxes
      .map((box) => box.value)
      .join("")
      .toLowerCase();

    if (guess.length === 0) {
      this.showMessage("Please enter all letters", "warning");
      return;
    }

    if (guess.length !== this.currentWord.length) {
      this.showMessage("Please fill all boxes", "warning");
      return;
    }

    if (this.guessedWords.includes(guess)) {
      this.showMessage(`You already guessed "${guess}"`, "warning");
      return;
    }

    this.guessedWords.push(guess);

    if (guess === this.currentWord) {
      this.handleCorrectGuess();
    } else {
      this.handleWrongGuess(guess);
    }
  }

  handleCorrectGuess() {
    this.score++;
    this.updateDisplay();
    this.highlightCorrectBoxes();
    this.showMessage(
      `🎉 Correct! The word is "${this.currentWord}"`,
      "success",
    );
    this.disableLetterBoxes();
    this.gameActive = false;

    setTimeout(() => {
      this.startNewRound();
    }, 2000);
  }

  handleWrongGuess(guess) {
    this.guessesLeft--;
    this.updateDisplay();
    this.highlightIncorrectBoxes();
    this.showMessage(`❌ Wrong! "${guess}" is not the word.`, "error");

    // Clear letter boxes for next guess
    this.letterBoxes.forEach((box) => {
      box.value = "";
      box.classList.remove("incorrect");
    });

    if (this.letterBoxes.length > 0) {
      this.letterBoxes[0].focus();
    }

    if (this.guessesLeft <= 0) {
      this.endGame();
    }
  }

  highlightCorrectBoxes() {
    this.letterBoxes.forEach((box) => {
      box.classList.add("correct");
      box.disabled = true;
    });
  }

  highlightIncorrectBoxes() {
    this.letterBoxes.forEach((box) => {
      if (box.value) {
        box.classList.add("incorrect");
      }
    });
  }

  disableLetterBoxes() {
    this.letterBoxes.forEach((box) => {
      box.disabled = true;
    });
  }

  enableLetterBoxes() {
    this.letterBoxes.forEach((box) => {
      box.disabled = false;
      box.classList.remove("correct", "incorrect");
    });
  }

  endGame() {
    this.gameActive = false;
    this.submitBtn.disabled = true;
    this.disableLetterBoxes();

    this.gameOverTitle.textContent = "😢 Game Over!";
    this.gameOverWord.textContent = `The word was: ${this.currentWord}`;
    this.gameOverEl.classList.add("show");

    this.showMessage(`Game Over! Your final score: ${this.score}`, "warning");
  }

  resetGame() {
    this.score = 0;
    this.guessesLeft = 6;
    this.gameActive = true;
    this.guessedWords = [];

    this.submitBtn.disabled = false;
    this.guessForm.reset();

    this.startNewRound();
  }

  updateDisplay() {
    this.guessesLeftDisplay.textContent = this.guessesLeft;
    this.scoreDisplay.textContent = this.score;
  }

  showMessage(text, type) {
    this.messageEl.textContent = text;
    this.messageEl.className = `message show ${type}`;
  }

  clearMessage() {
    this.messageEl.classList.remove("show");
    this.messageEl.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WordGuessingGame();
});
