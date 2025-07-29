// import { GameCore } from "../../core/game/game-core";

import { attachAutoReleaseTexturesEventToScene } from "../../utils/optimization";

export class LoadingScene extends Phaser.Scene {
  private fullLoaded = {
    once: false,
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

  create() {
    const { width, height } = this.scale;
    attachAutoReleaseTexturesEventToScene(this, "scenes.loading.");
    const volleyLogo = this.add
      .image(width / 2, height / 2, "scenes.loading.volley-logo")
      .setAlpha(0);

    // Dev purpose.
    if (import.meta.env.DEV) {
      // this.scene.launch("hud");
      // this.scene.bringToTop("hud");
      this.scene.start("main-menu");
      // this.scene.start("game");
      // this.scene.start("game-board");
      // this.scene.start("new-game-board");
      // this.scene.start("choose-question");
      // this.scene.start("reply-question", { question: GameCore.questions.getQuestionsByCategory("Capitals")[0] });
    }

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
      this.fullLoaded.loadingAds
    ) {
      this.fullLoaded.once = true;
      this.scene.start("main-menu");
    }
  }
}
