class WordGuessingGame {
  constructor() {
    this.words = [];
    this.currentWord = null;
    this.currentHint = null;
    this.guessesLeft = 6;
    this.score = 0;
    this.gameActive = true;
    this.guessedWords = [];

    this.initElements();
    this.loadWords();
    this.attachEventListeners();
  }

  initElements() {
    this.guessInput = document.getElementById('guessInput');
    this.submitBtn = document.getElementById('submitBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.hintText = document.getElementById('hintText');
    this.guessesLeftDisplay = document.getElementById('guessesLeft');
    this.scoreDisplay = document.getElementById('score');
    this.messageEl = document.getElementById('message');
    this.gameOverEl = document.getElementById('gameOver');
    this.gameOverTitle = document.getElementById('gameOverTitle');
    this.gameOverWord = document.getElementById('gameOverWord');
    this.guessForm = document.getElementById('guessForm');
  }

  attachEventListeners() {
    this.guessForm.addEventListener('submit', (e) => this.handleGuess(e));
    this.resetBtn.addEventListener('click', () => this.resetGame());
  }

  loadWords() {
    fetch('words.json')
      .then(response => response.json())
      .then(data => {
        this.words = data.words;
        this.startNewRound();
      })
      .catch(error => {
        console.error('Error loading words:', error);
        this.showMessage('Error loading game data', 'error');
      });
  }

  startNewRound() {
    if (this.words.length === 0) {
      this.showMessage('No words available', 'error');
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
    this.updateDisplay();
    this.clearMessage();
    this.guessInput.disabled = false;
    this.guessInput.focus();
    this.gameOverEl.classList.remove('show');
  }

  handleGuess(e) {
    e.preventDefault();

    if (!this.gameActive) {
      return;
    }

    const guess = this.guessInput.value.trim().toLowerCase();

    if (!guess) {
      this.showMessage('Please enter a guess', 'warning');
      return;
    }

    if (guess.length === 0) {
      this.showMessage('Guess cannot be empty', 'warning');
      return;
    }

    if (this.guessedWords.includes(guess)) {
      this.showMessage(`You already guessed "${guess}"`, 'warning');
      return;
    }

    this.guessedWords.push(guess);

    if (guess === this.currentWord) {
      this.handleCorrectGuess();
    } else {
      this.handleWrongGuess(guess);
    }

    this.guessInput.value = '';
    this.guessInput.focus();
  }

  handleCorrectGuess() {
    this.score++;
    this.updateDisplay();
    this.showMessage(`🎉 Correct! The word is "${this.currentWord}"`, 'success');
    this.guessInput.disabled = true;
    this.gameActive = false;

    setTimeout(() => {
      this.startNewRound();
    }, 2000);
  }

  handleWrongGuess(guess) {
    this.guessesLeft--;
    this.updateDisplay();
    this.showMessage(`❌ Wrong! "${guess}" is not the word.`, 'error');

    if (this.guessesLeft <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameActive = false;
    this.guessInput.disabled = true;
    this.submitBtn.disabled = true;

    this.gameOverTitle.textContent = '😢 Game Over!';
    this.gameOverWord.textContent = `The word was: ${this.currentWord}`;
    this.gameOverEl.classList.add('show');

    this.showMessage(`Game Over! Your final score: ${this.score}`, 'warning');
  }

  resetGame() {
    this.score = 0;
    this.guessesLeft = 6;
    this.gameActive = true;
    this.guessedWords = [];

    this.submitBtn.disabled = false;
    this.guessInput.disabled = false;
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
    this.messageEl.classList.remove('show');
    this.messageEl.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WordGuessingGame();
});
