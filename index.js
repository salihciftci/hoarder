const http = require("http");
const io = require("socket.io")(http);

class Room {
    constructor(name) {
        this.name = name;
        this.gold = undefined;
        this.game = false;
        this.players = [];
    }
}

class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.score = 0;
    }
}

class Gold {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}

class Game {
    init() {
        this.rooms = [];
        io.on("connection", (socket) => {
            console.log(`Player ${socket.id} connected`);

            socket.on("disconnect", () => this.disconnect(socket));

            socket.on("game", (client) => {
                if (client.process === "init") {
                    this.processInit(client);
                } else if (client.process === "gameUpdate") {
                    this.processUpdate(client);
                }
            });
        })
    }

    disconnect(socket) {
        this.rooms.forEach((room) => {
            room.players.forEach((player, i) => {
                if (player.id === socket.id) {
                    room.players.splice(i, 1);
                }
            })
        })
    }

    processInit(client) {
        let player = new Player(client.player.id, client.player.x, client.player.y);
        let found = false;
        if (this.rooms.length !== 0) {
            this.rooms.forEach((room) => {
                if (room.name === client.room) {
                    found = true;
                    if (room.players.length < 2) {
                        room.players.push(player);
                    } else {
                        io.emit("game", {"process": "gameUpdate", "roomStatus": "full"});
                    }
                }
            });
            if (!found) {
                let room = new Room(client.room);
                room.players.push(player);
                this.rooms.push(room)
            }
        } else {
            let room = new Room(client.room);
            room.players.push(player);
            this.rooms.push(room)
        }

        this.rooms.forEach((room) => {
            if (room.players.length === 2) {
                room.game = true;

                let gold = new Gold(this.generatePoint(), this.generatePoint());
                room.gold = gold;
                io.emit("game", {
                    "process": "gameStart",
                    "room": room.name,
                    "players": room.players,
                    "gold": gold
                });
            }
        })
    }

    processUpdate(client) {
        this.rooms.forEach((room) => {
            room.players.forEach((player) => {
                if (player.id === client.player.id) {
                    let score = client.player.score;
                    player.x = client.player.x;
                    player.y = client.player.y;

                    if (player.x === room.gold.x && player.y === room.gold.y) {
                        score++;

                        if (score >= 10) {
                            io.emit("game", {
                                "process": "gameEnd",
                                "winner": player.id
                            });
                            return;
                        }

                        room.gold.x = this.generatePoint();
                        room.gold.y = this.generatePoint();
                    }


                    player.score = score;

                    io.emit("game", {
                        "process": "gameUpdate",
                        "room": room.name,
                        "players": room.players,
                        "gold": room.gold
                    });
                }
            })
        })
    }

    generatePoint() {
        let x;
        while (true) {
            x = Math.floor(Math.random() * 700);
            if (x % 20 === 0)
                break;
        }
        return x
    }
}


const game = new Game();
game.init();

io.listen(3000, () => {
    console.log("Live:3000")
});