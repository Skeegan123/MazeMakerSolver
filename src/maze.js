let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");

let current;

class Maze {
    constructor(rows, columns) {
        this.horizSize = 1000;
        this.vertSize = (this.horizSize / columns) * rows;
        this.columns = columns;
        this.rows = rows;
        this.grid = [];
        this.stack = [];
        this.setup();
    }

    setup() {
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.columns; c++) {
                let cell = new Cell(r, c, this.grid, this.vertSize, this.horizSize);
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0];
        this.draw();
    }

    draw() {
        maze.width = this.horizSize;
        maze.height = this.vertSize;
        maze.style.background = "black";
        current.visited = true;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                let grid = this.grid;
                grid[r][c].show(this.vertSize, this.horizSize, this.rows, this.columns)
            }
        }

        let next = current.checkNeighbors(this.rows, this.columns);

        if (next) {
            next.visited = true;

            this.stack.push(current);

            current.highlight(this.rows, this.columns);

            current.removeWalls(current, next)

            current = next;
        } else if (this.stack.length > 0) {
            let cell = this.stack.pop();
            current = cell;
            current.highlight(this.rows, this.columns)
        }

        if (this.stack.length === 0) {
            return;
        }

        window.requestAnimationFrame(() => {
            this.draw();
        })
    }
}

class Cell {
    constructor(rowNum, colNum, parentGrid, parentVertSize, parentHorizSize) {
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.parentGrid = parentGrid;
        this.parentVertSize = parentVertSize;
        this.parentHorizSize = parentHorizSize;
        this.visited = false;
        this.walls = {
            topWall : true,
            rightWall : true,
            bottomWall : true,
            leftWall : true
        }
    }

    checkNeighbors(rows, columns) {
        let grid = this.parentGrid;
        let row = this.rowNum;
        let col = this.colNum;
        let neighbours = [];

        let top = row !== 0 ? grid[row - 1][col] : undefined;
        let right = col !== columns - 1 ? grid[row][col + 1] : undefined;
        let bottom = row !== rows - 1 ? grid[row + 1][col] : undefined;
        let left = col !== 0 ? grid[row][col - 1] : undefined;

        if (top && !top.visited) neighbours.push(top);
        if (right && !right.visited) neighbours.push(right);
        if (bottom && !bottom.visited) neighbours.push(bottom);
        if (left && !left.visited) neighbours.push(left);
        
        if (neighbours.length !== 0) {
            let random = Math.floor(Math.random() * neighbours.length);
            return neighbours[random];
        } else {
            return undefined;
        }
    }

    drawTopWall(x, y, vertSize, horizSize, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + horizSize / columns, y);
        ctx.stroke();
    }

    drawRightWall(x, y, vertSize, horizSize, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x + horizSize / columns, y);
        ctx.lineTo(x + horizSize / columns, y + vertSize / rows);
        ctx.stroke();
    }

    drawBottomWall(x, y, vertSize, horizSize, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y + vertSize / rows);
        ctx.lineTo(x + horizSize / columns, y + vertSize / rows);
        ctx.stroke();
    }

    drawLeftWall(x, y, vertSize, horizSize, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + vertSize / rows);
        ctx.stroke();
    }

    highlight(rows, columns) {
        let x = (this.colNum * this.parentHorizSize) / columns + 1;
        let y = (this.rowNum * this.parentVertSize) / rows + 1;

        ctx.fillStyle = "purple";
        ctx.fillRect(x, y, this.parentHorizSize / columns - 1, this.parentVertSize / rows - 3)
    }

    removeWalls(cell1, cell2) {
        let x = (cell1.colNum - cell2.colNum);

        if (x === 1) {
            cell1.walls.leftWall = false;
            cell2.walls.rightWall = false;
        } else if (x === -1) {
            cell1.walls.rightWall = false;
            cell2.walls.leftWall = false;
        }

        let y = (cell1.rowNum - cell2.rowNum);

        if (y === 1) {
            cell1.walls.topWall = false;
            cell2.walls.bottomWall = false;
        } else if (y === -1) {
            cell1.walls.bottomWall = false;
            cell2.walls.topWall = false;
        }
    }

    show(vertSize, horizSize, rows, columns) {
        let x = (this.colNum * horizSize) / columns;
        let y = (this.rowNum * vertSize) / rows;

        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;

        if (this.walls.topWall) {
            this.drawTopWall(x, y, vertSize, horizSize, columns, rows);
        }
        if (this.walls.rightWall) {
            this.drawRightWall(x, y, vertSize, horizSize, columns, rows);
        }
        if (this.walls.bottomWall) {
            this.drawBottomWall(x, y, vertSize, horizSize, columns, rows);
        }
        if (this.walls.leftWall) {
            this.drawLeftWall(x, y, vertSize, horizSize, columns, rows);
        }
        if (this.visited) {
            ctx.fillRect(x + 1, y + 1, horizSize / columns - 2, vertSize / rows - 2);
        }
    }
}

// let r = document.getElementById("rows").value;
// let c = document.getElementById("columns").value;

// console.log(r);
// console.log(c);

// let newMaze = new Maze(10, 10);
// newMaze.setup();
// newMaze.draw();