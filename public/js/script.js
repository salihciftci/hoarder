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
}

class Game {
    constructor() {
        this.canvas = document.getElementById("canvas")
        this.canvas.focus()
        this.ctx = this.canvas.getContext("2d")

        this.player = new Player(200, 350)
        this.gold = new Gold(600, 365)
    }

    init() {
        this.player.image.onload = () => {
            this.ctx.drawImage(this.player.image, this.player.x, this.player.y, 64, 64)
        }

        this.gold.image.onload = () => {
            this.ctx.drawImage(this.gold.image, this.gold.x, this.gold.y, 24, 24)
        }

        this.canvas.addEventListener("keydown", this.move.bind(this), false)
        this.canvas.addEventListener("keyup", () => { this.player.stop() }, false)

        setInterval(this.update.bind(this), 100)
    }

    draw() {
        this.gold.loop()
        this.ctx.clearRect(0, 0, 800, 800)
        this.ctx.drawImage(this.gold.image, this.gold.x, this.gold.y, 24, 24)
        this.ctx.drawImage(this.player.image, this.player.x, this.player.y, 64, 64)
        this.ctx.font = "20px Arial"
        this.ctx.fillText("Score: " + this.player.gold.toString(), 5, 795)
    }

    update() {
        if (this.player.x + 15 === this.gold.x && this.player.y + 15 === this.gold.y) {
            this.player.gold++

            while (true) {
                this.gold.x = Math.floor(Math.random() * 800)
                if (this.gold.x % 5 === 0) {
                    break;
                }
            }
            while (true) {
                this.gold.y = Math.floor(Math.random() * 800)
                if (this.gold.y % 5 === 0) {
                    break;
                }
            }
        }
        this.draw();
    }

    move(e) {
        this.player.move()
        switch (e.keyCode) {
            case 87:
                if (this.player.y - 5 > -10) {
                    this.player.y -= 5
                }
                break;
            case 83:
                if (this.player.y + 5 < 750) {
                    this.player.y += 5
                }
                break;
            case 65:
                if (this.player.x - 5 > -20) {
                    this.player.x -= 5
                }
                break;
            case 68:
                if (this.player.x + 5 < 750) {
                    this.player.x += 5
                }
                break;
            default: break;
        }
        this.gold.count--
        this.draw()
    }
}


var game = new Game()
game.init()
