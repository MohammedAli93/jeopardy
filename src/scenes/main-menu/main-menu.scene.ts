export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("main-menu");
  }

  async create() {
    const { width, height } = this.scale;
    // For some reason I can't get the correct video size, so I'm hardcoding it.
    const VIDEO_WIDTH = 1280;
    const VIDEO_HEIGHT = 720;

    // Background
    const video = this.add.video(
      width / 2,
      height / 2,
      "scenes.main-menu.background-video"
    );
    video.setScale(Math.max(width / VIDEO_WIDTH, height / VIDEO_HEIGHT));
    video.getFirstFrame();
    video.setAlpha(0);

    // Title Background
    const container = this.add.container(width / 2, height / 2);
    const titleBackground = this.add.image(
      0,
      0,
      "scenes.main-menu.title-background"
    );
    const buttonSinglePlayer = this.add.image(
      0,
      0,
      "scenes.main-menu.button-single-player"
    );
    buttonSinglePlayer.setPosition(
      titleBackground.x - buttonSinglePlayer.displayWidth / 2 + 20,
      titleBackground.y +
        titleBackground.displayHeight / 2 -
        buttonSinglePlayer.displayHeight -
        50
    );
    const buttonMultiplayer = this.add.image(
      0,
      0,
      "scenes.main-menu.button-multiplayer"
    );
    buttonMultiplayer.setPosition(
      titleBackground.x + buttonMultiplayer.displayWidth / 2 + 20,
      titleBackground.y +
        titleBackground.displayHeight / 2 -
        buttonMultiplayer.displayHeight -
        50
    );
    const copyrights = this.add.image(
      0,
      titleBackground.y + titleBackground.displayHeight / 2 - 50,
      "scenes.main-menu.copyrights"
    );
    container.add(titleBackground);
    container.add(buttonSinglePlayer);
    container.add(buttonMultiplayer);
    container.add(copyrights);
    container.setAlpha(0);

    // Title
    const title = this.add.image(
      width / 2,
      height / 2,
      "scenes.main-menu.title"
    );
    title.setAlpha(0);

    // Animations
    await new Promise((resolve) =>
      this.tweens.add({
        targets: video,
        delay: 500,
        props: {
          alpha: { from: 0, to: 1 },
        },
        onComplete: resolve,
      })
    );

    video.play(true);

    this.tweens.add({
      targets: container,
      delay: 2_000,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 1.5, to: 1 },
      },
    });

    this.tweens.add({
      targets: title,
      delay: 2_000,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 0, to: 1 },
      },
    });

    // [TEMP] We don't have a start button for now, so let's just wait 5 seconds and start the game.
    this.time.delayedCall(5_000, () => {
      this.scene.start("game");
    });
  }
}
