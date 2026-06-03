var socket = io();

function refreshRooms(rooms){
    console.log('refresh rooms');
    for (const room of rooms){
        if (room)
        console.log(room);
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room';

        const roomTitle = document.createElement('strong');
        roomTitle.innerText = room;

        const kawaiiJoinButton = document.createElement('button');
        kawaiiJoinButton.className = 'joinButton';
        kawaiiJoinButton.addEventListener('click', (e)=>{
            socket.emit('join game', user);
        });
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