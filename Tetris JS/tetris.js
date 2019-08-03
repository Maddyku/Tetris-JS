const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {    //Representing the Tetris blocks in Pixelated Matrices
    if (type === 'T') { //T Block
        return [    
            [0, 0, 0], //0s are incactives
            [1, 1, 1],
            [0, 1, 0],
        ];
    }   else if (type === 'O') {  //Square Block
        return [
            [2, 2],
            [2, 2],
        ];
    }   else if (type === 'L') {  //L Block
        return [
            [0, 3 , 0], 
            [0, 3 , 0],
            [0, 3 , 3],
        ];
    }   else if (type === 'J') {  //J Block
        return [
            [0, 4, 0], 
            [0, 4, 0],
            [4, 4, 0],
        ];
    }   else if (type === 'I') {  //I Block
        return [
            [0, 5, 0, 0], 
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    }   else if (type === 'S') {  //S Block
        return [
            [0, 6, 6], 
            [6, 6, 0],
            [0, 0, 0],
        ];
    }   else if (type === 'Z') {  //Z Block
        return [
            [7, 7, 0], 
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}


function draw() {
    context.fillStyle = '#000'; //Black Canvas
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    drawMatrix(arena, {x: 0, y:0});
    
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                  1, 1);
            }
        })
    })
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;         
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {  //for rotation of Tetris pieces
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}



let dropCounter = 0;
let dropInterval = 1000; //After every 1000 ms = 1 second we drop the piece

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);  //continuosuly updates Canvas
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

const colors = [    //Tetris block colors stored in colors array
    null,       //0
    'purple',   //1
    'yellow',   //2
    'orange',   //3
    'blue',     //4
    'aqua',     //5
    'green',    //6
    'red',      //7
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { //if left arrow keystroke is tapped
        playerMove(-1);         //move player piece left
    } else if (event.keyCode == 39) { //if right arrow keystroke is tapped
        playerMove(+1);               //move player piece right          
    } else if (event.keyCode == 40) { //if down arrow keystroke is tapped
        playerDrop()                  //move player piece down    
    } else if (event.keyCode === 81) {  //if q keystroke is tapped
        playerRotate(-1);             //rotate player piece to left
    } else if (event.keyCode === 87) {  //if w keystroke is tapped
        playerRotate(1);              //rotate player piece to right
    }
});


playerReset();
updateScore();
update();