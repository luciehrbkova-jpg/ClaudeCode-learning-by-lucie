const ROWS = 10;
const COLS = 10;
const MINE_COUNT = 10;

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let firstClick = true;
let timerInterval = null;
let seconds = 0;
let flagMode = false;

function init() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  gameOver = false;
  firstClick = true;
  seconds = 0;
  clearInterval(timerInterval);
  document.getElementById('timer').textContent = '⏱ 0';
  document.getElementById('mine-count').textContent = `💣 ${MINE_COUNT}`;
  document.getElementById('message').textContent = '';
  render();
}

function placeMines(safeRow, safeCol) {
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (board[r][c] === -1) continue;
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
    board[r][c] = -1;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === -1) continue;
      board[r][c] = countAdjacentMines(r, c);
    }
  }
}

function countAdjacentMines(row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === -1) count++;
    }
  }
  return count;
}

function reveal(row, col) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
  if (revealed[row][col] || flagged[row][col]) return;
  revealed[row][col] = true;
  if (board[row][col] === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        reveal(row + dr, col + dc);
  }
}

function toggleFlag(row, col) {
  if (gameOver || revealed[row][col]) return;
  flagged[row][col] = !flagged[row][col];
  const flagsUsed = flagged.flat().filter(Boolean).length;
  document.getElementById('mine-count').textContent = `💣 ${MINE_COUNT - flagsUsed}`;
  render();
}

function handleClick(row, col) {
  if (gameOver || revealed[row][col]) return;

  if (flagMode) {
    toggleFlag(row, col);
    return;
  }

  if (flagged[row][col]) return;

  if (firstClick) {
    firstClick = false;
    placeMines(row, col);
    timerInterval = setInterval(() => {
      seconds++;
      document.getElementById('timer').textContent = `⏱ ${seconds}`;
    }, 1000);
  }

  if (board[row][col] === -1) {
    revealed[row][col] = true;
    gameOver = true;
    clearInterval(timerInterval);
    revealAllMines();
    render();
    document.getElementById('message').textContent = '💥 Šlápnul jsi na minu!';
    return;
  }

  reveal(row, col);
  render();
  checkWin();
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] === -1) revealed[r][c] = true;
}

function checkWin() {
  let unrevealedSafe = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!revealed[r][c] && board[r][c] !== -1) unrevealedSafe++;
  if (unrevealedSafe === 0) {
    gameOver = true;
    clearInterval(timerInterval);
    document.getElementById('message').textContent = `🎉 Vyhrál jsi za ${seconds}s!`;
  }
}

function render() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (board[r][c] === -1) {
          cell.classList.add('mine-hit');
          cell.textContent = '💣';
        } else if (board[r][c] > 0) {
          cell.textContent = board[r][c];
          cell.dataset.count = board[r][c];
        }
      } else if (flagged[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
      }

      cell.addEventListener('click', () => handleClick(r, c));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });
      boardEl.appendChild(cell);
    }
  }
}

document.getElementById('reset-btn').addEventListener('click', init);

document.getElementById('flag-btn').addEventListener('click', () => {
  flagMode = !flagMode;
  const btn = document.getElementById('flag-btn');
  btn.textContent = flagMode ? '🚩 Odznačit' : '🚩 Označit';
  btn.style.background = flagMode ? '#e94560' : '';
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

init();
