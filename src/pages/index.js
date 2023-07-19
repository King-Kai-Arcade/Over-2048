import { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';

class GameLogic {
  constructor() {
    this.board = this.emptyBoard();
    this.score = 0;
    this.addPiece();
    this.addPiece();
  }

  emptyBoard() {
    return Array(4).fill().map(() => Array(4).fill(0));
  }

  addPiece() {
    let options = [];
    this.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) {
          options.push({i, j});
        }
      });
    });

    if (options.length > 0) {
      let spot = options[Math.floor(Math.random() * options.length)];
      let r = Math.random();
      this.board[spot.i][spot.j] = r > 0.1 ? 2 : 4;
    }
  }

  slide(row) {
    let arr = row.filter(val => val);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    arr = zeros.concat(arr);
    return arr;
  }

  combine(row) {
    for (let i = 3; i >= 1; i--) {
      let a = row[i];
      let b = row[i - 1];
      if (a === b) {
        row[i] = a + b;
        this.score += row[i];
        row[i - 1] = 0;
      }
    }
    return row;
  }

  operate(row) {
    row = this.slide(row);
    row = this.combine(row);
    row = this.slide(row);
    return row;
  }

  rotateRight(matrix) {
    let result = this.emptyBoard();
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        result[i][j] = matrix[j][i];
      }
    }
    return result;
  }

  flip(matrix) {
    return matrix.map(row => row.reverse());
  }

  moveLeft() {
    let oldData = this.board.map(row => [...row]);
    for (let i = 0; i < 4; i++) {
      this.board[i] = this.operate(this.board[i]);
    }
    if (JSON.stringify(oldData) !== JSON.stringify(this.board)) {
      this.addPiece();
    }
  }

  moveRight() {
    let oldData = this.board.map(row => [...row]);
    this.board = this.flip(this.board);
    for (let i = 0; i < 4; i++) {
      this.board[i] = this.operate(this.board[i]);
    }
    this.board = this.flip(this.board);
    if (JSON.stringify(oldData) !== JSON.stringify(this.board)) {
      this.addPiece();
    }
  }

  moveUp() {
    let oldData = this.board.map(row => [...row]);
    this.board = this.rotateRight(this.board);
    for (let i = 0; i < 4; i++) {
      this.board[i] = this.operate(this.board[i]);
    }
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    if (JSON.stringify(oldData) !== JSON.stringify(this.board)) {
      this.addPiece();
    }
  }

  moveDown() {
    let oldData = this.board.map(row => [...row]);
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    for (let i = 0; i < 4; i++) {
      this.board[i] = this.operate(this.board[i]);
    }
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    this.board = this.rotateRight(this.board);
    if (JSON.stringify(oldData) !== JSON.stringify(this.board)) {
      this.addPiece();
    }
  }

  getBoard() {
    return this.board;
  }

  getScore() {
    return this.score;
  }
}

export default function Home() {
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setBestScore(localStorage.getItem('bestScore') || 0);
    const newGame = new GameLogic();
    setGame(newGame);
    setBoard(newGame.getBoard());
    setScore(newGame.getScore());
  }, []);

  const handleKeyDown = (event) => {
    if (!game) {
      return;
    }
  
    let newBoard;
    switch (event.key) {
      case 'd':
      case 'ArrowRight':

        game.moveLeft();
        newBoard = game.getBoard().map(row => [...row]);
        break;
      case 's':
      case 'ArrowDown':

        game.moveUp();
        newBoard = game.getBoard().map(row => [...row]);
        break;
      case 'w':
      case 'ArrowUp':

        game.moveDown();
        newBoard = game.getBoard().map(row => [...row]);
        break;
      case 'a':
      case 'ArrowLeft':

        game.moveRight();
        newBoard = game.getBoard().map(row => [...row]);
        break;
      default:
        return;
    }
  
    setBoard(newBoard);
    setScore(game.getScore());
    if (game.getScore() > bestScore) {
      setBestScore(game.getScore());
      localStorage.setItem('bestScore', game.getScore());
    }
  };


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game, bestScore]);

  const handleNewGame = () => {
    // This should reset the game.
    const newGame = new GameLogic();
    setGame(newGame);
    setBoard(newGame.getBoard());
    setScore(newGame.getScore());
  };

  if (!hasMounted) {
    return null;
  }

  function getColor(value) {
    switch (value) {
      case 2:
        return 'bg-yellow-100';
      case 4:
        return 'bg-yellow-300';
      case 8:
        return 'bg-yellow-500';
      case 16:
        return 'bg-yellow-700';
      case 32:
        return 'bg-orange-300';
      case 64:
        return 'bg-orange-500';
      case 128:
        return 'bg-orange-700';
      case 256:
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-4 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8 text-yellow-300">Dragon Ball Z 2048</h1>
      <div className="mb-4">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded" onClick={handleNewGame}>
          New Game
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {board.map((row, i) => (
          row.map((cell, j) => (
            <div className={`h-20 w-20 flex items-center justify-center rounded-lg ${cell === 0 ? 'bg-gray-700' : getColor(cell) + ' text-black text-2xl font-bold'}`} key={i * 4 + j}>
              {cell !== 0 && cell}
            </div>
          ))
        ))}
      </div>
      <div>
        <h2 className="text-3xl font-bold">Score: {score}</h2>
        <h2 className="text-3xl font-bold">Best Score: {bestScore}</h2>
      </div>
    </div>
  )
}
