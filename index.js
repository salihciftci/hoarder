var express = require('express');
var http = require("http").createServer(app)
var path = require('path');
var logger = require('morgan');
var io = require("socket.io")(http)

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

var game = false
playerCount = 0

player1 = {
    id: null,
    x: 0,
    y: 0,
    score: 0,
}

player2 = {
    id: null,
    x: 0,
    y: 0,
    score: 0,
}

io.on("connection", (socket) => {
    console.log("New Player connected");
    playerCount++
    if (playerCount === 2) {
        game = true
        io.emit("init", { player1, player2, "game": game })
    } else {
        game = false
        io.emit("init", { player1, player2, "game": game })
    }


    socket.on("disconnect", () => {
        console.log("Player disconnected")
        playerCount--
        player1.id = null
        player2.id = null

        if (playerCount === 2) {
            game = true
            io.emit("init", { player1, player2, "game": game })
        } else {
            game = false
            io.emit("init", { player1, player2, "game": game })
        }
    })

    socket.on("init", (client) => {
        if (playerCount === 0) {
            player1.id = socket.id
            player1.x = client.data.x
            player1.y = client.data.y
            player1.score = client.data.gold
        } else if (playerCount === 1) {
            player2.id = socket.id
            player2.x = client.data.x
            player2.y = client.data.y
            player2.score = client.data.gold
        } else {
            console.log("DOLU");
        }
    })

    socket.on("update", (client) => {
        if (player1.id === null) {
            player1.id = socket.id
            player1.x = client.data.x
            player1.y = client.data.y
            player1.score = client.data.gold
        } else {
            player2.id = socket.id
            player2.x = client.data.x
            player2.y = client.data.y
            player2.score = client.data.gold
        }
        io.emit("update", { player1, player2, "game": game })
        console.log(player1, player2);
    })
})

http.listen(5002, () => { console.log("Live:3000") })
app.listen(5001)