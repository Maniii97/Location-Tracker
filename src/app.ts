import express from 'express';
const socket = require('socket.io');
import { createServer } from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = socket(server);

app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(express.json());    // Parse JSON bodies to all routes
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

const users: { [key: string]: string } = {}; 

io.on('connection', (socket: any) => {
    console.log('User Connected');
    socket.on('newUser', (data: any) => {
      users[socket.id] = data.name;
  });
    socket.on('sendLocation',(data : any)=>{
      io.emit('newLocation',{id : socket.id, name : users[socket.id], ...data});
    })
    socket.on('disconnect', () => {
        console.log('User Disconnected');
        io.emit('userDisconnected', socket.id);
    });
});

app.get("/", (req, res) => {
  res.render("name");
});

app.get("/map", (req, res) => {
  res.render("map");
});

// global catches
app.all("*", (_req, _res) => {
    _res.status(404).send("Page Not Found");
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
