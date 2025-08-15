import { attachAutoReleaseTexturesEventToScene } from "../../utils/optimization";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    console.log("GameScene init");
  }

  preload() {
    // Game
    this.load.setPath("assets/scenes/game");
    this.load.setPrefix("scenes.game.");

    this.load.image("background", "background.png");

    // Game Board
    this.load.setPath("assets/scenes/game-board");
    this.load.setPrefix("scenes.game-board.");

    this.load.image("category-background", "category-background.png");
    this.load.image("question-background", "question-background.png");
    this.load.image("jeopardy-small-logo", "jeopardy-small-logo.jpg");
    this.load.image("jeopardy-large-logo", "jeopardy-large-logo.jpg");
    this.load.image("background", "background.jpg");
    this.load.image("card", "card.jpg");
  }

  create() {
    console.log("GameScene create");
    const { width, height } = this.scale;
    attachAutoReleaseTexturesEventToScene(this, ["scenes.game.", "scenes.game-board."]);

    // Background
    this.add.image(width / 2, height / 2, "scenes.game.background");

    // this.scene.launch("choose-question");
    this.input.keyboard?.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (event: KeyboardEvent) => {
        if (event.key === "q") {
          this.scene.start("choose-question");
        }
      }
    );
    this.add
      .text(100, 100, "Press [Q] to see the questions")
      .setFontFamily("'Swiss 911 Ultra Compressed BT'")
      .setFontSize(80);

    this.scene.launch("podium", {
      podiums: [{ name: "Morgan" }, { name: "You" }, { name: "Jessica" }],
    });
  }
}
