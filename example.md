# 2Dアクションゲーム
`objects` 変数内にゲーム内に登場する背景やプレイヤー、ブロックなど全ての物体が格納されています。まずは`objects`変数を用いてブロックや敵を増やしてみましょう。
```
objects.push(
  ...
  new Enemy(windowWidth * 3 / 4, windowHeight / 2),
  new Ground(windowHeight - 20),
  new Block(100, windowHeight - 100, 50),
  new MovingBlock(200, windowHeight - 100, 50, 4, -2, 100),
  ...
)
```
また、`Enemy`クラスは横移動のみ行うシンプルな敵を定義しています。このクラスを継承して、より複雑な動きをする敵を定義してみましょう。
