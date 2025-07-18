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
    // For some reason I can't get the correct video size, so I'm hardcoding it.
    const VIDEO_WIDTH = 854;
    const VIDEO_HEIGHT = 480;

    // Background
    const video = this.add.video(width / 2, height / 2, "scenes.game.intro");
    video.setScale(Math.max(width / VIDEO_WIDTH, height / VIDEO_HEIGHT));
    video.play();

    video.once(Phaser.GameObjects.Events.VIDEO_COMPLETE, async () => {
      const background = this.add
        .image(width / 2, height / 2, "scenes.game.background")
        .setAlpha(0);

      await Promise.all([
        new Promise((resolve) =>
          this.tweens.add({
            targets: video,
            props: {
              alpha: { from: 1, to: 0 },
            },
            duration: 250,
            onComplete: resolve,
          })
        ),
        new Promise((resolve) =>
          this.tweens.add({
            targets: background,
            props: {
              alpha: { from: 0, to: 1 },
            },
            duration: 250,
            onComplete: resolve,
          })
        ),
      ]);

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
    });
  }
}
