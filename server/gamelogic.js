class GameLogic {
  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.board = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    this.players = ["A", "B"];
    this.turn = 0;
    this.moveHistory = { A: [], B: [] };
    this.initBoard();
  }

  initBoard() {
    this.board[0] = ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"];
    this.board[4] = ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"];
  }

  getState() {
    return {
      board: this.board,
      currentPlayer: this.players[this.turn],
      moveHistory: this.moveHistory,
    };
  }

  processMove(move) {
    const { piece, startPosition, endPosition, currentPlayer } = move;
    const [startRow, startCol] = startPosition;
    const [endRow, endCol] = endPosition;

    if (
      piece.startsWith(currentPlayer) &&
      this.board[startRow][startCol] === piece
    ) {
      const newPosition = this.calculateNewPosition(
        startRow,
        startCol,
        endRow,
        endCol,
        piece
      );
      if (newPosition && this.isValidPosition(newPosition, piece)) {
        this.executeMove(startRow, startCol, endRow, endCol, piece);
        const rowChange = endRow - startRow;
        const colChange = endCol - startCol;
        const direction = "Farward";
        if (rowChange === 0) {
          this.moveHistory[currentPlayer].push(
            `Moved ${piece} ${colChange > 0 ? "Right" : "Left"}`
          );
        } else if (colChange === 0) {
          this.moveHistory[currentPlayer].push(
            `Moved ${piece} ${rowChange > 0 ? "Down" : "Up"}`
          );
        } else if (Math.abs(rowChange) === 2 && Math.abs(colChange) === 2) {
          if (rowChange > 0 && colChange > 0) {
            this.moveHistory[currentPlayer].push(
              `Moved ${piece} Backward-Right`
            );
          } else if (rowChange > 0 && colChange < 0) {
            this.moveHistory[currentPlayer].push(
              `Moved ${piece} Backward-Left`
            );
          } else if (rowChange < 0 && colChange > 0) {
            this.moveHistory[currentPlayer].push(
              `Moved ${piece} Forward-Right`
            );
          } else if (rowChange < 0 && colChange < 0) {
            this.moveHistory[currentPlayer].push(`Moved ${piece} Forward-Left`);
          }
        }

        if (this.checkWinCondition()) {
          return { valid: true, winner: currentPlayer };
        }

        this.turn = 1 - this.turn;
        return { valid: true };
      }
    }

    return { valid: false, reason: "Invalid move" };
  }

  calculateNewPosition(startRow, startCol, endRow, endCol, piece) {
    const pieceType = piece.split("-")[1];

    if (pieceType === "P1" || pieceType === "P2" || pieceType === "P3") {
      if (
        (Math.abs(endRow - startRow) === 1 && endCol === startCol) ||
        (Math.abs(endCol - startCol) === 1 && endRow === startRow)
      ) {
        return { row: endRow, col: endCol };
      }
    } else if (pieceType === "H1") {
      if (
        (Math.abs(endRow - startRow) === 2 && endCol === startCol) ||
        (Math.abs(endCol - startCol) === 2 && endRow === startRow)
      ) {
        return { row: endRow, col: endCol };
      }
    } else if (pieceType === "H2") {
      if (
        Math.abs(endRow - startRow) === 2 &&
        Math.abs(endCol - startCol) === 2
      ) {
        return { row: endRow, col: endCol };
      }
    }
    return null;
  }

  isValidPosition(position, piece) {
    const { row, col } = position;
    return (
      row >= 0 &&
      row < 5 &&
      col >= 0 &&
      col < 5 &&
      (this.board[row][col] === null ||
        !this.board[row][col].startsWith(piece[0]))
    );
  }

  executeMove(startRow, startCol, endRow, endCol, piece) {
    const opponent = this.players[1 - this.turn];
    if (startRow === endRow) {
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      for (let col = minCol + 1; col < maxCol; col++) {
        if (
          this.board[startRow][col] &&
          this.board[startRow][col].startsWith(opponent)
        ) {
          this.board[startRow][col] = null;
        }
      }
    } else if (startCol === endCol) {
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      for (let row = minRow + 1; row < maxRow; row++) {
        if (
          this.board[row][startCol] &&
          this.board[row][startCol].startsWith(opponent)
        ) {
          this.board[row][startCol] = null;
        }
      }
    } else if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) {
      const rowIncrement = endRow > startRow ? 1 : -1;
      const colIncrement = endCol > startCol ? 1 : -1;
      let row = startRow + rowIncrement;
      let col = startCol + colIncrement;
      while (row !== endRow && col !== endCol) {
        if (this.board[row][col] && this.board[row][col].startsWith(opponent)) {
          this.board[row][col] = null;
        }
        row += rowIncrement;
        col += colIncrement;
      }
    }

    this.board[endRow][endCol] = piece;
    this.board[startRow][startCol] = null;
  }

  checkWinCondition() {
    const opponentPieces = this.board
      .flat()
      .filter((cell) => cell && cell.startsWith(this.players[1 - this.turn]));
    return opponentPieces.length === 0;
  }
}

module.exports = GameLogic;
