export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    console.log("GameScene init");
  }

  create() {
    console.log("GameScene create");
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.game.background");
    // this.scene.launch("choose-question");
    this.input.keyboard?.once(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (event: KeyboardEvent) => {
      if (event.key === "q") {
        this.scene.start("choose-question");
      }
    });
    this.add
      .text(100, 100, "Press [Q] to see the questions")
      .setFontFamily("'Swiss 911 Ultra Compressed BT'")
      .setFontSize(80);
  }
}
