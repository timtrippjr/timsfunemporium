var socket = io();

socket.on('rooms updated', (rooms) => {
    console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const room of rooms){
        const roomName = room[0];
        const roomUsers = room[1];

        if (roomName == socket.id) continue;

        const roomDiv = newElem('div', roomsDiv);
        roomDiv.className = 'room';

        const roomTitle = newElem('strong', roomDiv);
        roomTitle.innerText = roomName;

        const kawaiiJoinButton = newElem('button', roomDiv);
        kawaiiJoinButton.innerText = 'join button bruh bruh';
        kawaiiJoinButton.style = 'float:right;'
        kawaiiJoinButton.className = 'joinButton';
        kawaiiJoinButton.addEventListener('click', (e)=>{
            socket.emit('join game', roomName);
        });

        /*console.log(roomUsers);
        const innerRooms = newElem('ul', roomDiv);
        for (const roomUser of roomUsers){
            const innerRoom = newElem('li', innerRooms);
            innerRoom.innerText = roomUser;
        }*/
    }
});

socket.on('connect', ()=>{
    document.getElementById('loggedInMsg')
        .innerText = 'logged in as: ' + socket.id;
});

// show game board, hide available rooms.
socket.on('successfully joined', (data)=>{
    const notif = newElem('div', document.getElementById('content'));
    notif.className += 'successnotif ';
    notif.innerHTML = 'successfully joined user: ' + data;

    document.getElementById('roomsContainer').remove();
});

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);