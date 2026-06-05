var socket = io();

const roomsCont = document.getElementById('roomsContainer');
const gameCont = document.getElementById('gameContainer');
gameCont.style.display = 'none';

class Game{
    constructor(gameId){
        this.canvas = document.getElementById(gameId);
        this.ctx = this.canvas.getContext('2d');

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(
            0, 0, 
            this.canvas.clientWidth, 
            this.canvas.clientHeight
        );

        // draw the lines of a tictactoe board
        this.ctx.fillStyle = 'gray';

        const barWidth = 2;
        
        this.ctx.fillRect(
            (this.canvas.clientWidth / 3) - (barWidth / 2), 
            (this.canvas.clientHeight / 3) - (barWidth / 2), 
            barWidth, this.canvas.clientHeight - (this.canvas.clientHeight / 3)
        );
    }
}

socket.on('rooms updated', (rooms) => {
    console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const [room, users] of Object.entries(rooms)){
        //if (room == socket.id) continue;

        const roomDiv = newElem('div', roomsDiv);
        roomDiv.className = 'room';

        const roomTitle = newElem('strong', roomDiv);
        roomTitle.innerText = room;
        if (room == socket.id) {
            roomTitle.innerText += ' (you)';
        }else{
            const kawaiiJoinButton = newElem('button', roomDiv);
            kawaiiJoinButton.innerText = 'join button bruh bruh';
            kawaiiJoinButton.style = 'float:right;'
            kawaiiJoinButton.className = 'joinButton';
            kawaiiJoinButton.addEventListener('click', (e)=>{
                socket.emit('join game', room);
            });
        }


        console.log(users);
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
socket.on('successfully joined', (room)=>{
    console.log(socket.id + ' joined ' + room);
    /*const notif = newElem('div', document.getElementById('content'));
    notif.className += 'successnotif ';
    notif.innerHTML = 'successfully joined user: ' + room;*/

    roomsCont.style.display = 'none';
    gameCont.style.display = 'block';

    const game = new Game('game');

    game.ctx.font = "bold 30px Arial";      // Sets size and font family
    game.ctx.fillStyle = "blue";            // Sets solid text color
    game.ctx.strokeStyle = "black";         // Sets outline color
    game.ctx.lineWidth = 2;                 // Sets outline thickness

    // 3. Draw the text (text, x, y)
    game.ctx.fillText('i joined '+room, 50, 100);    // Draws solid text
});