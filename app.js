const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io').listen(server);
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const connection = new WebSocket('ws://10.2.88.140:7000');


let id = 1;
let users = [];
let foods = [];
let connections = [];
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.get('/', function(req, res){
    res.render('index', {flag: false});
});



server.listen(PORT, function() {
    console.log('Server running on port',PORT);
});

function Food(id, x, y, r, val){
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.val = val;
}

function User(id, x, y, r, name, speed, col) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.name = name;
    this.speed = speed;
    this.col = col;
}
var now = Date.now();
// console.log(now);
connection.on('open', function open(){
    console.log('Opened!');
});

app.post("/user", function(req, res){
    res.render('index', {addr: req.body.address, flag: true});
});

app.get("/time", function(req, res){
    // console.log(Date.now() - now);
    res.send({now: Date.now() - now});
});

app.get("/results", function(req, res){
    res.render('result', {users: users});
});

app.get("/result", function(req, res){
    
    res.json({users: users});
});
function triggerSend() {
    // console.log('Trigger Send!');
    // connection.emit('data', function(){
        // console.log('Yopo!');
        const data = {
            users: JSON.stringify(users),
            foods: JSON.stringify(foods),
        };
        connection.send(JSON.stringify(data));
    // });
}

setInterval(draw, 100);
setInterval(addFood, 1000);

function addFood(){
    if(foods.length < 40){
        foods.push(new Food(id, Math.random() * 1920, Math.random() * 1080, 8, Math.floor(Math.random() * 4) + 1));
        id++;
    }
}

function draw(){
    io.sockets.emit('tick', { users, foods });
    triggerSend();
}

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected.', connections.length);
    
    socket.on('start', function(data){
        var user = new User(socket.id, data.x, data.y, data.r, data.name, data.speed, 
            data.col);
        users.push(user);
    });
    
    socket.on('update', function(data){
        var newUser = {};
        users.forEach(user => {
            if(user.id === socket.id){
                newUser = user;
            }
        });
        newUser.x = data.x;
        newUser.y = data.y;
        newUser.r = data.r;
        newUser.name = data.name;
        newUser.speed = data.speed;
        newUser.col = data.col;
    });
    
    socket.on('eat food', function(foodId){
        foods = foods.filter(food => foodId !== food.id);
    });
    
    
    //Disconnect
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        // users = users.filter(user => user.id !== socket.id);
        console.log('Disconnected: %s sockets connected.', connections.length);
    });
});