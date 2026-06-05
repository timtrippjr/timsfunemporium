var socket = io();

const roomsCont = document.getElementById('roomsContainer');
const gameCont = document.getElementById('gameContainer');
gameCont.style.display = 'none';

var game;

class Game{
    constructor(gameId){
        this.canvas = document.getElementById(gameId);
        this.ctx = this.canvas.getContext('2d');

        this.tileSize = this.canvas.clientWidth / 3;

        this.canvasClicked = this.canvasClicked.bind(this);
        this.canvas.addEventListener('click', this.canvasClicked);
        // keep an "idea" of game state, is updated 
        // when receiving a msg from server
        this.state = null;
        this.room = null;

        // html stuff
        this.turnInd = document.getElementById('turnIndicator');

        this.drawBoard();
    }

    drawBoard(){
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(
            0, 0, 
            this.canvas.clientWidth, 
            this.canvas.clientHeight
        );

        /*/draw test text
        this.ctx.font = "bold 30px 'Times New Roman'";
        this.ctx.fillStyle = "blue";
        this.ctx.fillText('joined '+data.room, 50, 100);//*/

        // draw the lines of a tictactoe board
        this.ctx.fillStyle = 'gray';
        const barWidth = 2;
        const padding = 10;
        for (var i = 1; i <= 2; i++) {
            this.ctx.fillRect(
                (this.canvas.clientWidth / 3 * i) - (barWidth / 2), 
                padding, 
                barWidth, 
                this.canvas.clientHeight - (padding * 2)
            );
        }
        for (var i = 1; i <= 2; i++) {
            this.ctx.fillRect(
                padding, 
                (this.canvas.clientHeight / 3 * i) - (barWidth / 2), 
                this.canvas.clientWidth - (padding * 2),
                barWidth
            );
        }
    }

    canvasClicked(event) {
        const rect = this.canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const c = Math.floor(x/this.tileSize);
        const r = Math.floor(y/this.tileSize);
        console.log(`Canvas coordinates: (${c}, ${r})`);

        if (this.state.turn == socket.id){
            console.log('SEND MESSAGE SET RC AS MY ID ON SERVER SEND BACK TO BOTH CLIENTS');
            socket.emit('game set symbol', {
                room: this.room,
                id: socket.id, 
                at: {r, c},
            });
        }
    }

    update(){
        
        // update turn signal
        this.turnInd.innerText = this.state.turn+'\'s turnb';
        if (this.state.turn == socket.id) 
            this.turnInd.innerText = 'YOUR TURNB';

        // update board appearance (where x and os are)
        const xPlayer = this.state.x;
        const oPlayer = this.state.o;
        const board = this.state.board;

        this.ctx.font = "bold 80px 'Times New Roman'";


        this.drawBoard();

        for (let r = 0; r < board.length; r++){
            for (let c = 0; c < board[r].length; c++){

                if (board[r][c] == this.state.x){
                    this.ctx.fillStyle = "blue";
                    this.ctx.fillText(
                        'X', 
                        c*this.tileSize + 24, 
                        r*this.tileSize + 80
                    );
                }
                if (board[r][c] == this.state.o){
                    this.ctx.fillStyle = "red";
                    this.ctx.fillText(
                        'O', 
                        c*this.tileSize + 24, 
                        r*this.tileSize + 80
                    );
                }

            }
        }
    }
}

socket.on('rooms updated', (rooms) => {
    //console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const [room, data] of Object.entries(rooms)){
        const users = data.users;
        const joinable = data.joinable;

        console.log('joinable '+ joinable);
        //if (room == socket.id) continue;

        const roomDiv = newElem('div', roomsDiv);
        roomDiv.className = 'room';

        const roomTitle = newElem('strong', roomDiv);
        roomTitle.innerText = room;
        if (room == socket.id) {
            roomTitle.innerText += ' (you)';
        }else if(joinable){
            const kawaiiJoinButton = newElem('button', roomDiv);
            kawaiiJoinButton.innerText = 'join button bruh bruh';
            kawaiiJoinButton.style = 'float:right;'
            kawaiiJoinButton.className = 'joinButton';
            kawaiiJoinButton.addEventListener('click', (e)=>{
                socket.emit('join game', room);
            });
        }


        //console.log(users);
        const innerRooms = newElem('ul', roomDiv);
        for (const user of users){
            const innerRoom = newElem('li', innerRooms);
            innerRoom.innerText = user;
            if (user == socket.id) 
                innerRoom.innerText += ' (you)';
        }
    }
});

socket.on('connect', ()=>{
    document.getElementById('loggedInMsg')
        .innerText = 'logged in as: ' + socket.id;
});
// show game board, hide available rooms.
socket.on('game begin', (data)=>{
    console.log(socket.id + ' joined ' + JSON.stringify(data));

    roomsCont.style.display = 'none';
    gameCont.style.display = 'block';

    game = new Game('game');
    game.room = data.room;
    game.state = data.state;
    game.update();
});

socket.on('game update', (data)=>{
    game.room = data.room;
    game.state = data.state;
    game.update();
});