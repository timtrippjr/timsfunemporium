var socket = io();

socket.on('rooms updated', (rooms) => {
    console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const [room, users] of Object.entries(rooms)){

        if (room == socket.id) continue;

        const roomDiv = newElem('div', roomsDiv);
        roomDiv.className = 'room';

        const roomTitle = newElem('strong', roomDiv);
        roomTitle.innerText = room;

        const kawaiiJoinButton = newElem('button', roomDiv);
        kawaiiJoinButton.innerText = 'join button bruh bruh';
        kawaiiJoinButton.style = 'float:right;'
        kawaiiJoinButton.className = 'joinButton';
        kawaiiJoinButton.addEventListener('click', (e)=>{
            socket.emit('join game', room);
        });

        console.log(users);
        const innerRooms = newElem('ul', roomDiv);
        for (const user of users){
            const innerRoom = newElem('li', innerRooms);
            innerRoom.innerText = user;
        }
    }
});

socket.on('connect', ()=>{
    document.getElementById('loggedInMsg')
        .innerText = 'logged in as: ' + socket.id;
});

// show game board, hide available rooms.
socket.on('successfully joined', (data)=>{
    console.log(socket.id + ' joined ' + data);
    /*const notif = newElem('div', document.getElementById('content'));
    notif.className += 'successnotif ';
    notif.innerHTML = 'successfully joined user: ' + data;*/

    //document.getElementById('roomsContainer').remove();
});

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);