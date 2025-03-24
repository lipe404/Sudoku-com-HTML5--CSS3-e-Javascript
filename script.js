document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("sudoku-grid");
    const cells = [];
    const SIZE = 9;
    const SUBGRID_SIZE = 3;

    // Cria a grade do Sudoku
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.className = "cell";
        cell.maxLength = 1; // Permite apenas um dígito
        cell.dataset.index = i; // Armazena o índice da célula
        cells.push(cell);
        grid.appendChild(cell);
    }

    // Gera um quebra-cabeça de Sudoku aleatório
    generateSudoku();

    // Lógica para resolver o Sudoku
    document.getElementById("solve-button").addEventListener("click", () => {
        if (solveSudoku()) {
            alert("Sudoku resolvido!");
        } else {
            alert("Não foi possível resolver o Sudoku.");
        }
    });

    function generateSudoku() {
        const board = createEmptyBoard();
        fillBoard(board);
        removeNumbers(board);
        fillCells(board);
    }

    function createEmptyBoard() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function fillBoard(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffleArray([...Array(SIZE).keys()].map(n => n + 1));
                    for (const num of numbers) {
                        if (isValid(num, row, col, board)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // Não foi possível preencher
                }
            }
        }
        return true; // Tabuleiro preenchido
    }

    function removeNumbers(board) {
        let count = 40; // Número de células a serem removidas
        while (count > 0) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);
            if (board[row][col] !== 0) {
                board[row][col] = 0; // Remove o número
                count--;
            }
        }
    }

    function fillCells(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = row * SIZE + col;
                if (board[row][col] !== 0) {
                    cells[index].value = board[row][col];
                    cells[index].disabled = true; // Desabilita células preenchidas
                } else {
                    cells[index].value = ""; // Célula vazia
                }
            }
        }
    }

    function solveSudoku() {
        const emptyCell = findEmptyCell();
        if (!emptyCell) {
            return true; // Sudoku resolvido
        }

        const [row, col] = emptyCell;

        for (let num = 1; num <= SIZE; num++) {
            if (isValid(num, row, col)) {
                cells[row * SIZE + col].value = num;

                if (solveSudoku()) {
                    return true;
                }

                cells[row * SIZE + col].value = ""; // Backtrack
            }
        }

        return false; // Não foi possível resolver
    }

    function findEmptyCell() {
        for (let i = 0; i < SIZE * SIZE; i++) {
            if (cells[i].value === "") {
                return [Math.floor(i / SIZE), i % SIZE]; // Retorna a posição (linha, coluna)
            }
        }
        return null; // Nenhuma célula vazia encontrada
    }

    function isValid(num, row, col, board) {
        // Verifica a linha
        for (let i = 0; i < SIZE; i++) {
            if (board[row][i] === num) {
                return false;
            }
        }

        // Verifica a coluna
        for (let i = 0; i < SIZE; i++) {
            if (board[i][col] === num) {
                return false;
            }
        }

        // Verifica o quadrante 3x3
        const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
        const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;
        for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
            for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
                if (board[i][j] === num) {
                    return false;
                }
            }
        }

        return true; // O número é válido
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});