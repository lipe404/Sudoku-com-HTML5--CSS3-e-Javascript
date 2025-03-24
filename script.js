document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("sudoku-grid");
    const cells = [];
    const SIZE = 9;
    const SUBGRID_SIZE = 3;
    let currentBoard = createEmptyBoard();

    // Cria a grade do Sudoku
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.className = "cell";
        cell.maxLength = 1;
        cell.dataset.index = i;
        
        // Validação de entrada - permite apenas números de 1 a 9
        cell.addEventListener("input", (e) => {
            const value = e.target.value;
            if (value && !/^[1-9]$/.test(value)) {
                e.target.value = "";
            }
        });
        
        cells.push(cell);
        grid.appendChild(cell);
    }

    // Gera um novo jogo quando a página carrega
    generateSudoku();

    // Botão para resolver o Sudoku
    document.getElementById("solve-button").addEventListener("click", () => {
        // Primeiro verifica se o tabuleiro atual é válido
        if (!isCurrentBoardValid()) {
            alert("O tabuleiro contém valores inválidos. Corrija antes de resolver.");
            return;
        }
        
        // Cria uma cópia do tabuleiro atual para resolver
        const boardToSolve = getCurrentBoardState();
        
        // Tenta resolver o Sudoku
        if (solveSudoku(boardToSolve)) {
            // Atualiza a interface com a solução
            updateCellsFromBoard(boardToSolve);
            alert("Seu jogo será resolvido!");
        } else {
            alert("Não foi possível resolver este Sudoku. O tabuleiro pode estar inválido.");
        }
    });

    // Gera um novo jogo de Sudoku
    function generateSudoku() {
        // Limpa o tabuleiro atual
        currentBoard = createEmptyBoard();
        clearAllCells();
        
        // Gera um tabuleiro completo válido
        fillBoard(currentBoard);
        
        // Remove alguns números para criar o puzzle
        removeNumbers(currentBoard);
        
        // Preenche as células da interface
        fillCells(currentBoard);
    }

    function createEmptyBoard() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function fillBoard(board) {
        // Tenta preencher o tabuleiro com backtracking
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffleArray([...Array(SIZE).keys()].map(n => n + 1));
                    for (const num of numbers) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function removeNumbers(board) {
        let cellsToRemove = 40 + Math.floor(Math.random() * 10); // Remove entre 40-49 números
        let attempts = 0;
        const maxAttempts = 200;
        
        while (cellsToRemove > 0 && attempts < maxAttempts) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);
            
            if (board[row][col] !== 0) {
                const temp = board[row][col];
                board[row][col] = 0;
                
                // Verifica se ainda tem solução única
                const boardCopy = board.map(row => [...row]);
                if (countSolutions(boardCopy) === 1) {
                    cellsToRemove--;
                } else {
                    board[row][col] = temp; // Reverte se não for solução única
                }
                
                attempts++;
            }
        }
    }

    function countSolutions(board, count = 0) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE && count < 2; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            count = countSolutions(board, count);
                            board[row][col] = 0;
                        }
                    }
                    return count;
                }
            }
        }
        return count + 1;
    }

    function fillCells(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = row * SIZE + col;
                if (board[row][col] !== 0) {
                    cells[index].value = board[row][col];
                    cells[index].classList.add("fixed");
                    cells[index].disabled = true;
                } else {
                    cells[index].value = "";
                    cells[index].classList.remove("fixed");
                    cells[index].disabled = false;
                }
            }
        }
    }

    function solveSudoku(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function isValidPlacement(num, row, col, board) {
        // Verifica a linha
        for (let i = 0; i < SIZE; i++) {
            if (board[row][i] === num && i !== col) {
                return false;
            }
        }

        // Verifica a coluna
        for (let i = 0; i < SIZE; i++) {
            if (board[i][col] === num && i !== row) {
                return false;
            }
        }

        // Verifica o quadrante 3x3
        const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
        const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;
        for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
            for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
                if (board[i][j] === num && i !== row && j !== col) {
                    return false;
                }
            }
        }

        return true;
    }

    function isCurrentBoardValid() {
        const board = getCurrentBoardState();
        
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const num = board[row][col];
                if (num !== 0 && !isValidPlacement(num, row, col, board)) {
                    // Destaca a célula inválida
                    const index = row * SIZE + col;
                    cells[index].classList.add("invalid");
                    setTimeout(() => cells[index].classList.remove("invalid"), 2000);
                    return false;
                }
            }
        }
        return true;
    }

    function getCurrentBoardState() {
        const board = createEmptyBoard();
        for (let i = 0; i < SIZE * SIZE; i++) {
            const row = Math.floor(i / SIZE);
            const col = i % SIZE;
            board[row][col] = cells[i].value ? parseInt(cells[i].value) : 0;
        }
        return board;
    }

    function updateCellsFromBoard(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = row * SIZE + col;
                if (!cells[index].classList.contains("fixed")) {
                    cells[index].value = board[row][col];
                }
            }
        }
    }

    function clearAllCells() {
        cells.forEach(cell => {
            cell.value = "";
            cell.classList.remove("fixed", "invalid");
            cell.disabled = false;
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});