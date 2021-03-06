class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;

        this.score = 0;

        this.image = new Image();
        this.image.src = "../img/stop.png"
    }

    move() {
        this.image.src = "../img/move.png"
    }

    stop() {
        this.image.src = "../img/stop.png"
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, 64, 64)
    }
}

class Gold {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.image = new Image();
        this.image.src = "../img/coin/1.png";
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, 24, 24)
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.canvas.focus();
        this.ctx = this.canvas.getContext("2d");

        this.socket = io("localhost:3000")

        this.socket.on("disconnect", () => {
            alert("Disconnected from server.");
            window.location.reload();
        })

    }

    init() {
        this.run = false;
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`Connected to room ${this.room}`, 290, 400);
        this.ctx.fillText(`Waiting other player to connect`, 270, 425);

        let x, y;

        while (true) {
            x = Math.floor(Math.random() * 700);
            if (x % 20 === 0) {
                break;
            }
        }

        while (true) {
            y = Math.floor(Math.random() * 700);
            if (y % 20 === 0) {
                break;
            }
        }

        this.player = new Player(this.socket.id, x, y);

        this.socket.emit("game", {"process": "init", "room": this.room, "player": this.player});

        this.canvas.addEventListener("keydown", this.move.bind(this), false);
        this.canvas.addEventListener("keyup", () => {
            this.player.stop()
        }, false);

        this.socket.on("game", (game) => {
            if (game.process === "gameStart") {
                if (game.room === this.room) {
                    this.start(game);
                }
            } else if (game.process === "gameUpdate") {
                if (game.roomStatus === "full") {
                    alert("Room is full.");
                    window.location.reload();
                    return
                }
                if (game.room === this.room) {
                    this.update(game);
                }
            } else if (game.process === "gameEnd") {
                if (game.winner === this.socket.id) {
                    alert("Win!");
                } else {
                    alert("Lose");
                }
                window.location.reload();
            }
        });
    }

    start(game) {
        this.run = true;
        this.ctx.clearRect(0, 0, 800, 800);

        this.player.draw(this.ctx);

        game.players.forEach((p) => {
            if (p.id !== this.player.id) {
                this.player2 = new Player(p.id, p.x, p.y);
            }
        });

        this.gold = new Gold(game.gold.x, game.gold.y);
        this.gold.draw(this.ctx);

        this.player2.draw(this.ctx);
    }

    update(game) {
        this.ctx.clearRect(0, 0, 800, 800);

        game.players.forEach((p) => {
            if (p.id === this.player2.id) {
                this.player2.x = p.x;
                this.player2.y = p.y;
                this.player2.score = p.score;
            } else {
                this.player.score = p.score;
            }
            this.gold.x = game.gold.x;
            this.gold.y = game.gold.y;
        });

        this.player.draw(this.ctx);
        this.player2.draw(this.ctx);
        this.gold.draw(this.ctx);


        this.ctx.font = "20px Arial";
        this.ctx.fillText("Your Score: " + this.player.score.toString(), 5, 795);
        this.ctx.fillText("Enemy Score: " + this.player2.score.toString(), 645, 795);
    }

    move(e) {
        if (!this.run) {
            return
        }

        switch (e.which) {
            case 87: // W
                if (this.player.y - 5 > -10) {
                    this.player.y -= 20
                }
                break;
            case 83: // S
                if (this.player.y + 5 < 750) {
                    this.player.y += 20
                }
                break;
            case 65: // A
                if (this.player.x - 5 > -20) {
                    this.player.x -= 20
                }
                break;
            case 68: // D
                if (this.player.x + 5 < 750) {
                    this.player.x += 20
                }
                break;
            default:
                break;
        }

        this.player.move();
        this.socket.emit("game", {"process": "gameUpdate", "player": this.player});
    }

    setRoom() {
        let value = document.getElementById("room").value;
        if (value !== undefined && value !== "") {
            this.room = document.getElementById("room").value;

            document.getElementById("room").style.visibility = "hidden";
            document.getElementById("enter").style.visibility = "hidden";
            document.getElementById("roomLabel").style.visibility = "hidden";

            this.init();
        } else {
            alert("Enter room name");
        }
    }
}

let game = new Game();
