const http = require("http");
const io = require("socket.io")(http);

class Player {
    constructor(ID, x, y) {
        this.id = ID;
        this.x = x;
        this.y = y;
        this.score = 0;
    }

    update(x, y, score) {
        this.x = x;
        this.y = y;
        this.score = score;
    }
}

// Todo: Implement later
// class Gold {
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//     }
// }


class Game {
    constructor() {
        this.run = false;
        this.players = []
    }

    runGame() {
        this.run = this.players.length >= 2;
    }

    init() {
        io.on("connection", (socket) => {
            console.log(`Player ${socket.id} connected`);

            socket.on("disconnect", () => {
                this.players.forEach((e, i) => {
                    if (e.id === socket.id) {
                        this.players.splice(i, 1)
                    }
                    console.log(`Player ${socket.id} disconnected`);
                    this.runGame();
                    if (!this.run) {
                        console.log("Game is not running")
                    }
                    io.emit("init", {"players": this.players, "game": this.run})
                })
            });

            socket.on("init", (player) => {
                this.players.push(new Player(socket.id, player.data.x, player.data.y));
                console.log(this.players);

                this.runGame();
                if (this.run) {
                    console.log("Game is running");
                    io.emit("init", {"players": this.players, "game": this.run})
                }
            });

            socket.on("update", (player) => {
                this.players.forEach((e) => {
                    if (e.id === socket.id) {
                        e.update(player.data.x, player.data.y, player.data.gold) //TODO: change gold to score
                    }
                });

                io.emit("update", {"players": this.players, "game": this.run})
            });

        });
    }
}


const game = new Game();
game.init();

io.listen(3000, () => {
    console.log("Live:3000")
});