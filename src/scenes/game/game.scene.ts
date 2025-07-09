export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    this.add.image(400, 300, "jeopardy-logo");
  }
}