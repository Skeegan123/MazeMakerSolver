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

    aStar() {
        let start = this.grid[0][0];
        let end = this.grid[this.rows - 1][this.columns - 1];
        let open = [start];
        let closed = [];
        let k = 0;

        

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                this.grid[r][c].visited = false;
                this.grid[r][c].fValue = Infinity;
                this.grid[r][c].gValue = Infinity;
            }
        }

        start.fValue = 0;
        start.gValue = 0;

        while(open.length !== 0) {
        // while(k < 30) {
            k++;
            current = open[0]

            // if (open.length === 1) {
            // } else {
                for (let i = 0; i < open.length - 1; i++) {
                    if (open[i].fValue < current.fValue) {
                        current = open[i];
                        ////console.log(current.fValue);
                    }
                }
            // }
            open.splice(open.indexOf(current), 1);

            // //console.log(current);
            // closed.push(current);
            // //console.log("closed");
            // //console.log(closed);

            current.visited = true;

            // console.log(current.colNum + ", " + current.rowNum)

            let neighbors = current.checkNeighborsAStar(this.rows, this.columns);

            if (neighbors === undefined) {
                // //console.log("undefined");
            } else {

            //console.log(neighbors)

            for (let j = 0; j <= neighbors.length - 1; j++) {
                if (neighbors[j] === end) {
                    neighbors[j].parent = current;
                    console.log("found target!")
                    return this.reconstructPath(start, end);
                } else if (open.includes(neighbors[j]) && open[open.indexOf(neighbors[j])].fValue < neighbors[j].fValue) {
                    //console.log("check 1");
                } else if (closed.includes(neighbors[j]) && closed[closed.indexOf(neighbors[j])].fValue < neighbors[j].fValue) {
                    //console.log("check 2");
                } else {
                    neighbors[j].parent = current;
                    neighbors[j].gValue = current.gValue + 10;
                    neighbors[j].hValue = (Math.abs(neighbors[j].rowNum - end.rowNum) + Math.abs(neighbors[j].colNum - end.colNum)) * 10;
                    neighbors[j].fValue = neighbors[j].gValue + neighbors[j].hValue;
                    //console.log(neighbors[j].gValue);
                    open.push(neighbors[j]);
                    //console.log("open");
                    //console.log(open);
                    window.requestAnimationFrame(() => {
                        neighbors[j].highlightAStar(this.rows, this.columns);
                    })
                }
            }
        }

            //console.log(current);
            closed.push(current);
            //console.log("closed");
            //console.log(closed);
            
        }
    }

    reconstructPath(start, end) {
        let finalPath = [];
        let next = end.parent;
        let u = 0;
        finalPath.unshift(next);
        // while (u < 20) {
        window.requestAnimationFrame(() => {
        while (next.parent !== start) {
            u++;
            next.highlightPath(this.rows, this.columns);
            next = next.parent;
            finalPath.unshift(next);
            // next = next.parent;            
        }
    })
        console.log(finalPath);
        return 0;
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
        };
        this.fValue;
        this.gValue;
        this.hValue;
        this.parent;
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

    checkNeighborsAStar(rows, columns) {
        let grid = this.parentGrid;
        let row = this.rowNum;
        let col = this.colNum;
        let neighbours = [];

        let top = row !== 0 ? grid[row - 1][col] : undefined;
        let right = col !== columns - 1 ? grid[row][col + 1] : undefined;
        let bottom = row !== rows - 1 ? grid[row + 1][col] : undefined;
        let left = col !== 0 ? grid[row][col - 1] : undefined;

        if (top && !top.visited && !grid[row][col].walls.topWall) neighbours.push(top);
        if (right && !right.visited && !grid[row][col].walls.rightWall) neighbours.push(right);
        if (bottom && !bottom.visited && !grid[row][col].walls.bottomWall) neighbours.push(bottom);
        if (left && !left.visited && !grid[row][col].walls.leftWall) neighbours.push(left);
        
        if (neighbours.length !== 0) {
            return neighbours;
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

        ctx.fillStyle = "green";
        ctx.fillRect(x, y, this.parentHorizSize / columns - 1, this.parentVertSize / rows - 3)
    }

    highlightAStar(rows, columns) {
        let x = (this.colNum * this.parentHorizSize) / columns + 1;
        let y = (this.rowNum * this.parentVertSize) / rows + 1;

        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, this.parentHorizSize / columns - 1, this.parentVertSize / rows - 3)
    }

    highlightPath(rows, columns) {
        let x = (this.colNum * this.parentHorizSize) / columns + 1;
        let y = (this.rowNum * this.parentVertSize) / rows + 1;

        ctx.fillStyle = "red";
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

// //console.log(r);
// //console.log(c);

// let newMaze = new Maze(10, 10);
// newMaze.setup();
// newMaze.draw();