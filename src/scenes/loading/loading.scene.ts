export class LoadingScene extends Phaser.Scene {
  constructor() {
    super("loading");
  }

  startLoadingAssets() {
    // Main Menu Assets
    this.load.setPath("assets/scenes/main-menu");
    this.load.setPrefix("scenes.main-menu.");

    this.load.image("background", "background.png");
    this.load.image("title-background", "title-background.png");
    this.load.image("title", "title.png");
    this.load.image("button-single-player", "button-single-player.png");
    this.load.image("button-multiplayer", "button-multiplayer.png");
    this.load.image("copyrights", "copyrights.png");

    this.load.start();
  }

  create() {
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.scene.start("main-menu");
    });
    this.startLoadingAssets();
  }
}