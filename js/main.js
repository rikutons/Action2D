"use strict";
class RigidObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = gravity;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.ax;
        this.vy += this.ay;
        this.ay = gravity;
    }
    stop() {
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
    }
}
class StaticSquare {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }
    update() { }
    draw(ctx) {
        ctx.fillStyle = this.color;
        const s2 = this.size / 2;
        ctx.fillRect(this.x - s2, this.y - s2, this.size, this.size);
    }
}
class RigidSquare extends RigidObject {
    constructor(x, y, size, color) {
        super(x, y);
        this.size = size;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        const s2 = this.size / 2;
        ctx.fillRect(this.x - s2, this.y - s2, this.size, this.size);
    }
}
class Block extends StaticSquare {
    constructor(x, y, size) {
        super(x, y, size, "#c46f00");
    }
}
class MovingBlock extends StaticSquare {
    constructor(x, y, size, speedx, speedy, turnFrame) {
        super(x, y, size, "#c46f00");
        this.nowFrame = 0;
        this.speedx = speedx;
        this.speedy = speedy;
        this.turnFrame = turnFrame;
    }
    update() {
        this.x += this.speedx;
        this.y += this.speedy;
        this.nowFrame++;
        if (this.nowFrame == this.turnFrame) {
            this.speedx *= -1;
            this.speedy *= -1;
            this.nowFrame = 0;
        }
    }
}
class Goal extends StaticSquare {
    constructor(x, y) {
        super(x, y, 30, "#d2db25");
    }
}
class Ground {
    constructor(y) {
        this.y = y;
        this.x = 0;
    }
    update() { }
    draw(ctx) {
        ctx.fillStyle = "#00b818";
        ctx.fillRect(0, this.y, windowWidth, windowHeight - this.y);
    }
}
class TextElement {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.text = "";
    }
    update() { }
    draw(ctx) {
        ctx.font = "24px serif";
        ctx.fillStyle = "#000000";
        ctx.fillText(this.text, this.x, this.y);
    }
}
class BackGround {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    update() { }
    draw(ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, windowWidth, windowHeight);
    }
}
class Player extends RigidSquare {
    constructor() {
        super(windowWidth / 4, windowHeight / 2, 50, "#2478ff");
        this.onPlain = false;
        this.key = [];
        this.inertiax = 0;
        this.inertiay = 0;
        this.onKeyDown = function (event) {
            this.key[event.key] = true;
        };
        this.onKeyUp = function (event) {
            this.key[event.key] = false;
        };
        window.addEventListener("message", (e) => {
            switch (e.data.type) {
                case "keydown":
                    this.onKeyDown(e.data.e);
                    break;
                case "keyup":
                    this.onKeyUp(e.data.e);
                    break;
                default:
                    break;
            }
        });
    }
    update() {
        if (this.key[" "])
            if (this.onPlain) {
                this.vy = -30;
                this.onPlain = false;
            }
        if (this.key["d"])
            if (this.x < windowWidth - this.size / 2)
                this.x += 8;
        if (this.key["a"])
            if (this.x > this.size / 2)
                this.x -= 8;
        this.x += this.inertiax;
        this.y += this.inertiay;
        this.inertiax = 0;
        this.inertiay = 0;
        super.update();
    }
}
class Enemy extends RigidSquare {
    constructor(x, y) {
        super(x, y, 50, "#f53e31");
        this.onPlain = false;
        this.size = 50;
        this.vx = -4;
    }
    update() {
        super.update();
        if (this.x < 0)
            this.vx *= -1;
        if (this.x > windowWidth)
            this.vx *= -1;
    }
}
function init(width, height) {
    var _a;
    const cvs = document.createElement("canvas");
    cvs.width = width;
    cvs.height = height;
    (_a = document.getElementById("container")) === null || _a === void 0 ? void 0 : _a.appendChild(cvs);
    return cvs;
}
function hitSquarePlain(square, plain) {
    if (square.y + square.size / 2 >= plain.y) {
        return true;
    }
    return false;
}
function hit2Square(s1, s2) {
    const S = (s1.size + s2.size) / 2;
    if (Math.abs(s1.y - s2.y) <= S && Math.abs(s1.x - s2.x) <= S) {
        let dx, dy;
        if (s1.x > s2.x)
            dx = s1.x - s2.x - S;
        else
            dx = s1.x - s2.x + S;
        if (s1.y > s2.y)
            dy = s1.y - s2.y - S;
        else
            dy = s1.y - s2.y + S;
        return [dx, dy];
    }
    return false;
}
function checkHit(objects) {
    let onPlain = false;
    let player = undefined;
    for (const o1 of objects) {
        if (o1 instanceof Player)
            player = o1;
        for (const o2 of objects) {
            if ((o1 instanceof Player || o1 instanceof Enemy) && o2 instanceof Ground)
                if (hitSquarePlain(o1, o2)) {
                    o1.vy = o1.ay = 0;
                    o1.y = o2.y - o1.size / 2;
                    if (o1 instanceof Player)
                        onPlain = true;
                }
            if (o1 instanceof Player && o2 instanceof Enemy) {
                if (hit2Square(o1, o2)) {
                    clearInterval(game);
                    statusText.text = "Game Over!!";
                }
            }
            if (o1 instanceof Player && o2 instanceof Goal) {
                if (hit2Square(o1, o2)) {
                    clearInterval(game);
                    statusText.text = "Game Clear!!";
                }
            }
            if ((o1 instanceof Player && o2 instanceof Block) ||
                (o1 instanceof Player && o2 instanceof MovingBlock)) {
                const hit = hit2Square(o1, o2);
                if (hit) {
                    if (Math.abs(hit[0]) < Math.abs(hit[1]))
                        o1.x -= hit[0];
                    else {
                        o1.y -= hit[1];
                        if (hit[1] >= 0) {
                            o1.vy = o1.ay = 0;
                            if (o2 instanceof MovingBlock) {
                                o1.inertiax = o2.speedx;
                                o1.inertiay = o2.speedy;
                            }
                            onPlain = true;
                        }
                    }
                }
            }
        }
    }
    if (player)
        player.onPlain = onPlain;
}
function loop(objects, ctx) {
    for (const o of objects) {
        o.update();
    }
    checkHit(objects);
    for (const o of objects) {
        o.draw(ctx);
    }
}
const windowWidth = 700;
const windowHeight = 400;
const gravity = 4.9;
const cvs = init(windowWidth, windowHeight);
const ctx = cvs.getContext("2d");
const objects = [];
const statusText = new TextElement(10, 24);
objects.push(new BackGround(), new Player(), new Enemy((windowWidth * 3) / 4, windowHeight / 2), new Ground(windowHeight - 20), new Block(100, windowHeight - 100, 50), new MovingBlock(200, windowHeight - 100, 50, 4, -2, 100), new MovingBlock(250, windowHeight - 100, 50, 4, -2, 100), new Block(400, 70, 50), new Goal(400, 30), statusText);
const game = setInterval(loop, 30, objects, ctx);
