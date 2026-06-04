var socket = io();

function refreshRooms(rooms){
    console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const room of rooms){
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room';

        const roomTitle = document.createElement('strong');
        roomTitle.innerText = room[0];

        const kawaiiJoinButton = document.createElement('button');
        kawaiiJoinButton.innerText = 'join button bruh bruh';
        kawaiiJoinButton.style = 'float:right;'
        kawaiiJoinButton.className = 'joinButton';
        kawaiiJoinButton.addEventListener('click', (e)=>{
            socket.emit('join game', user);
        });

        roomDiv.appendChild(roomTitle);
        roomDiv.appendChild(kawaiiJoinButton);
        roomsDiv.appendChild(roomDiv);
    }
}

socket.on('connect', ()=>{
    document.getElementById('loggedInMsg')
        .innerText = 'logged in as: ' + socket.id;
});

socket.on('rooms updated', (rooms) => {
    refreshRooms(rooms);
});

socket.on('successfully joined', (data)=>{
    const notif = document.createElement('div');
    notif.className += 'successnotif ';
    notif.innerHTML = 'successfully joined user: ' + data;
});