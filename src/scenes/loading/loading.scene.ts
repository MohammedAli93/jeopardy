// import { GameCore } from "../../core/game/game-core";

export class LoadingScene extends Phaser.Scene {
  private fullLoaded = {
    once: false,
    assets: false,
    loadingAds: false,
  };

  constructor() {
    super("loading");
  }

  preload() {
    this.load.setPath("assets/scenes/loading");
    this.load.setPrefix("scenes.loading.");
    this.load.image("volley-logo", "volley-logo.png");
  }

  startLoadingAssets() {
    // Main Menu
    this.load.setPath("assets/scenes/main-menu");
    this.load.setPrefix("scenes.main-menu.");

    this.load.video("background-video", "background.mp4", true);
    this.load.image("title-background", "title-background.png");
    this.load.image("title", "title.png");
    this.load.image("button-single-player", "button-single-player.png");
    this.load.image("button-multiplayer", "button-multiplayer.png");
    this.load.image("copyrights", "copyrights.png");

    // Game
    this.load.setPath("assets/scenes/game");
    this.load.setPrefix("scenes.game.");

    this.load.image("background", "background.png");

    // Choose Question
    this.load.setPath("assets/scenes/choose-question");
    this.load.setPrefix("scenes.choose-question.");

    this.load.image("category-background", "category-background.png");
    this.load.image("question-background", "question-background.png");

    this.load.start();
  }

  create() {
    const { width, height } = this.scale;
    const volleyLogo = this.add
      .image(width / 2, height / 2, "scenes.loading.volley-logo")
      .setAlpha(0);

    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.fullLoaded.assets = true;
      
      // Dev purpose.
      if (import.meta.env.DEV) {
        this.fullLoaded.assets = false;
        this.scene.start("game");
        // this.scene.start("choose-question");
        // this.scene.start("reply-question", { question: GameCore.questions.getQuestionsByCategory("Capitals")[0] });
      }
    });

    this.startLoadingAssets();

    this.tweens.add({
      targets: volleyLogo,
      delay: 500,
      props: {
        alpha: { from: 0, to: 1 },
      },
      onComplete: () => {
        this.tweens.add({
          targets: volleyLogo,
          delay: 500,
          props: {
            alpha: { from: 1, to: 0 },
          },
          onComplete: () => {
            this.fullLoaded.loadingAds = true;
          },
        });
      },
    });
  }

  update() {
    if (
      !this.fullLoaded.once &&
      this.fullLoaded.assets &&
      this.fullLoaded.loadingAds
    ) {
      this.fullLoaded.once = true;
      this.scene.start("main-menu");
    }
  }
}
