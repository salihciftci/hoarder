class Player {
    constructor(x, y) {
        this.x = x
        this.y = y

        this.gold = 0

        this.image = new Image()
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
        this.x = x
        this.y = y


        this.image = new Image()
        this.image.src = "../img/coin/1.png"
        this.src = [
            "../img/coin/1.png",
            "../img/coin/2.png",
            "../img/coin/3.png",
            "../img/coin/4.png",
            "../img/coin/5.png",
            "../img/coin/6.png",
            "../img/coin/7.png",
            "../img/coin/8.png",
            "../img/coin/9.png",
            "../img/coin/10.png",
            "../img/coin/11.png",
            "../img/coin/12.png",
            "../img/coin/13.png",
            "../img/coin/14.png",
            "../img/coin/15.png",
            "../img/coin/16.png",
        ]

        this.count = 0
    }

    loop() {
        this.count++
        if (this.count === 15) {
            this.count = 0
        }
        this.image.src = this.src[this.count]
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, 24, 24)
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("canvas")
        this.canvas.focus()
        this.ctx = this.canvas.getContext("2d")
        this.timer = null

        this.socket = io("localhost:3000")
    }

    init() {

        // Giving random position to player
        while (true) {
            var x = Math.floor(Math.random() * 800)
            if (x % 20 === 0) {
                break;
            }
        }

        while (true) {
            var y = Math.floor(Math.random() * 800)
            if (y % 20 === 0) {
                break;
            }
        }

        this.ctx.font = "20px Arial"
        this.ctx.fillText("Diğer Oyuncu Bekleniyor..", 270, 400)

        this.player = new Player(x, y)

        // Telling socket to I'm Ready
        this.socket.emit("init", { "id": this.socket.id, "data": this.player })

        this.socket.on("init", (server) => {
            if (server.game) {
                this.player.draw(this.ctx)
                this.player2 = new Player(server.player2.x, server.player2.y)
                this.gold = new Gold(600, 360)
                this.gold.draw(this.ctx)
                this.ctx.drawImage(this.player2.image, this.player2.x, this.player2.y, 64, 64)
                console.log(this.player, this.player2);
                game.start()
            } else {
                // clearInterval(this.timer)
                clearTimeout(this.timer)
                this.ctx.clearRect(0, 0, 800, 800)
                this.ctx.font = "20px Arial"
                this.ctx.fillText("Diğer Oyuncu Bekleniyor..", 270, 400)
            }
        })

        this.socket.on("update", (players) => {
            this.player2.x = players.player2.x
            this.player2.y = players.player2.y
        })
    }

    start() {
        this.canvas.addEventListener("keydown", this.move.bind(this), false)
        this.canvas.addEventListener("keyup", () => { this.player.stop() }, false)

        this.timer = setInterval(this.update.bind(this), 100)
    }

    draw() {
        this.socket.emit("update", { "id": this.socket.id, "data": this.player })
        this.gold.loop()

        this.ctx.clearRect(0, 0, 800, 800)
        this.ctx.drawImage(this.gold.image, this.gold.x, this.gold.y, 24, 24)

        this.player.draw(this.ctx)
        this.player2.draw(this.ctx)

        this.ctx.font = "20px Arial"
        this.ctx.fillText("Score: " + this.player.gold.toString(), 5, 795)
    }

    update() {
        if (this.player.x + 32 === this.gold.x + 12 && this.player.y + 32 === this.gold.y + 12) {
            this.player.gold++

            while (true) {
                this.gold.x = Math.floor(Math.random() * 800)
                if (this.gold.x % 20 === 0) {
                    break;
                }
            }
            while (true) {
                this.gold.y = Math.floor(Math.random() * 800)
                if (this.gold.y % 20 === 0) {
                    break;
                }
            }
        }
        this.draw();
    }

    move(e) {
        switch (e.keyCode) {
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
            default: break;
        }

        this.player.move()
        this.draw()
    }
}


var game = new Game()
game.init()
