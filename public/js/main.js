const foodColors = ['#ecf0f1', '#3498db', '#2ecc71', '#ff2020'];
const submit = document.getElementById('submit');
const intro = document.getElementById('intro');

let user;
let users = [];
let foods = [];
let data = {};
let socket;
let name;
let value = 0;
let startGame = false;

submit.addEventListener('click', () => {
    name = document.getElementById('name').value;
    if(name){
        startGame = true;
        intro.style.display = "none";
        user.setName(name);
    } else {
        alert("Please enter your name!");
    }
});

function setup() {
    const cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    socket = io.connect();

    user = new User(name);

    var data = {
        x: user.x,
        y: user.y,
        r: user.r,
        name: user.name,
        speed: user.speed,
        col: user.col
    }

    socket.emit('start', data);

    socket.on('tick', function(data) {
        users = data.users;
        foods = data.foods;
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    eatFood();

    foods.forEach((food) => {
        fill(foodColors[food.val - 1]);
        ellipse(food.x, food.y, food.r * 2, food.r * 2);
    });

    for (var i = 0; i < users.length; i++) {
        var id = users[i].id;

        if (id !== socket.id) {
            fill(users[i].col);
            ellipse(users[i].x, users[i].y, users[i].r * 2, users[i].r * 2);

            fill(255);
            textAlign(CENTER);
            text(`${users[i].name}(${users[i].speed.toFixed(2)})`, users[i].x, users[i].y - users[i].r*1.5);
        }
    }
    user.show();

    var data = {
        x: user.x,
        y: user.y,
        r: user.r,
        name : user.name,
        speed: user.speed,
        col: user.col
    };
    socket.emit('update', data);
}

function eatFood() {
    foods.forEach((food) => {
        const d = dist(user.x, user.y, food.x, food.y);
        if(d < user.r + food.r){
            user.speed += food.val / 100;
            food.x = 1000;
            // user.score = user.speed + food.val * 0.01
            socket.emit('eat food', food.id);
        }
    });
}