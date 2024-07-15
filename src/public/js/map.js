const socket = io();

if (!userName) {
    window.location.href = '/';
} else {
    socket.emit('newUser', { name: userName });
}
console.log(userName);

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position) => {
        const {coords: {latitude, longitude}} = position;
        socket.emit('sendLocation', {name : userName , latitude, longitude});
    },(error) => {
        console.log(error);
    },{
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Mani bhai OP"
}).addTo(map);

const markers = {}

socket.on('newLocation', (data) => {
    const {id ,name, latitude, longitude} = data;
    map.setView([latitude, longitude], 16);
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
    }else{
        const locationMarker = L.marker([latitude, longitude]).addTo(map);
        const textIcon = L.divIcon({
            className: 'custom-text-icon', 
            html: `<div style='text-align: center; font-size : 22px;'><b>${name || "Person"}</b></div>`, // Your text here
            iconSize: [100, 20],
            iconAnchor: [50, -10] 
        });
    
        const textMarker = L.marker([latitude, longitude], {icon: textIcon, interactive: false}).addTo(map);
   
        markers[id] = {locationMarker, textMarker};
    }
});

socket.on('userDisconnected',(id) =>{
    map.removeLayer(markers[id]);
    delete markers[id];
})