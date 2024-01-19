interface Obj {
  x: number;
  y: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Square {
  x: number;
  y: number;
  size: number;
  color: string;
}

abstract class RigidObject implements Obj {
  vx: number = 0;
  vy: number = 0;
  ax: number = 0;
  ay: number = gravity;

  constructor(public x: number, public y: number) {}

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

  abstract draw(ctx: CanvasRenderingContext2D): void;
}

abstract class StaticSquare implements Square, Obj {
  constructor(
    public x: number,
    public y: number,
    public size: number,
    public color: string
  ) {}

  update() {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    const s2 = this.size / 2;
    ctx.fillRect(this.x - s2, this.y - s2, this.size, this.size);
  }
}

abstract class RigidSquare extends RigidObject implements Square {
  constructor(x: number, y: number, public size: number, public color: string) {
    super(x, y);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    const s2 = this.size / 2;
    ctx.fillRect(this.x - s2, this.y - s2, this.size, this.size);
  }
}

class Block extends StaticSquare {
  constructor(x: number, y: number, size: number) {
    super(x, y, size, "#c46f00");
  }
}

class MovingBlock extends StaticSquare {
  speedx: number;
  speedy: number;
  turnFrame: number;
  nowFrame: number = 0;

  constructor(
    x: number,
    y: number,
    size: number,
    speedx: number,
    speedy: number,
    turnFrame: number
  ) {
    super(x, y, size, "#c46f00");
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
  constructor(x: number, y: number) {
    super(x, y, 30, "#d2db25");
  }
}

class Ground implements Obj {
  x: number = 0;
  constructor(public y: number) {}

  update() {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#00b818";
    ctx.fillRect(0, this.y, windowWidth, windowHeight - this.y);
  }
}

class TextElement implements Obj {
  text: string = "";
  constructor(public x: number, public y: number) {}

  update() {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(this.text, this.x, this.y);
  }
}

class BackGround implements Obj {
  x: number = 0;
  y: number = 0;
  update() {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, windowWidth, windowHeight);
  }
}

type CallbackFunction = (event: KeyboardEvent) => void;
class Player extends RigidSquare {
  onKeyDown: CallbackFunction;
  onKeyUp: CallbackFunction;
  onPlain: boolean = false;
  key: number[] = [];
  inertiax: number = 0;
  inertiay: number = 0;
  constructor() {
    super(windowWidth / 4, windowHeight / 2, 50, "#2478ff");
    for (let i = 0; i < 256; i++) this.key[i] = 0;
    this.onKeyDown = function (event: KeyboardEvent) {
      this.key[event.keyCode]++;
    };
    this.onKeyUp = function (event: KeyboardEvent) {
      this.key[event.keyCode] = 0;
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
    if (this.key[" ".charCodeAt(0)] > 0)
      if (this.onPlain) {
        this.vy = -30;
        this.onPlain = false;
      }
    if (this.key["D".charCodeAt(0)] > 0)
      if (this.x < windowWidth - this.size / 2) this.x += 8;
    if (this.key["A".charCodeAt(0)] > 0)
      if (this.x > this.size / 2) this.x -= 8;
    this.x += this.inertiax;
    this.y += this.inertiay;
    this.inertiax = 0;
    this.inertiay = 0;
    super.update();
  }
}

class Enemy extends RigidSquare {
  onPlain: boolean = false;
  constructor(x: number, y: number) {
    super(x, y, 50, "#f53e31");
    this.size = 50;
    this.vx = -4;
  }

  update() {
    super.update();
    if (this.x < 0) this.vx *= -1;
    if (this.x > windowWidth) this.vx *= -1;
  }
}

function init(width: number, height: number) {
  const cvs = document.createElement("canvas");
  cvs.width = width;
  cvs.height = height;
  document.getElementById("container")?.appendChild(cvs);
  return cvs;
}

function hitSquarePlain(square: Square, plain: Obj) {
  if (square.y + square.size / 2 >= plain.y) {
    return true;
  }
  return false;
}

function hit2Square(s1: Square, s2: Square) {
  const S = (s1.size + s2.size) / 2;
  if (Math.abs(s1.y - s2.y) <= S && Math.abs(s1.x - s2.x) <= S) {
    let dx, dy;
    if (s1.x > s2.x) dx = s1.x - s2.x - S;
    else dx = s1.x - s2.x + S;
    if (s1.y > s2.y) dy = s1.y - s2.y - S;
    else dy = s1.y - s2.y + S;
    return [dx, dy];
  }
  return false;
}

function checkHit(objects: Obj[]) {
  let onPlain = false;
  let player: Player | undefined = undefined;
  for (const o1 of objects) {
    if (o1 instanceof Player) player = o1;
    for (const o2 of objects) {
      if ((o1 instanceof Player || o1 instanceof Enemy) && o2 instanceof Ground)
        if (hitSquarePlain(o1, o2)) {
          o1.vy = o1.ay = 0;
          o1.y = o2.y - o1.size / 2;
          if (o1 instanceof Player) onPlain = true;
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
      if (
        (o1 instanceof Player && o2 instanceof Block) ||
        (o1 instanceof Player && o2 instanceof MovingBlock)
      ) {
        const hit = hit2Square(o1, o2);
        if (hit) {
          if (Math.abs(hit[0]) < Math.abs(hit[1])) o1.x -= hit[0];
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
  if (player) player.onPlain = onPlain;
}

function loop(objects: Obj[], ctx: CanvasRenderingContext2D) {
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
const objects: Obj[] = [];
const statusText = new TextElement(10, 24);
objects.push(
  new BackGround(),
  new Player(),
  new Enemy((windowWidth * 3) / 4, windowHeight / 2),
  new Ground(windowHeight - 20),
  new Block(100, windowHeight - 100, 50),
  new MovingBlock(200, windowHeight - 100, 50, 4, -2, 100),
  new MovingBlock(250, windowHeight - 100, 50, 4, -2, 100),
  new Block(400, 70, 50),
  new Goal(400, 30),
  statusText
);
const game = setInterval(loop, 30, objects, ctx);
