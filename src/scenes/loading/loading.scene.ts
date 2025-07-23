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

    // this.load.video("background-video", "background.mp4", true);
    this.load.image("background", "background.webp");
    this.load.image("title-background", "title-background.webp");
    this.load.image("logo", "logo.webp");
    this.load.image("button-stack", "button-stack.webp");
    this.load.image("button", "button.webp");
    this.load.image("button-hover", "button-hover.webp");
    this.load.image("divider-h", "divider-h.png");
    this.load.image("button-settings", "button-settings.webp");
    this.load.image("button-saves", "button-saves.webp");
    this.load.image("button-guides", "button-guides.webp");
    this.load.image("button-a11y", "button-a11y.webp");

    // Game
    this.load.setPath("assets/scenes/game");
    this.load.setPrefix("scenes.game.");

    this.load.image("background", "background.png");
    this.load.video("intro", "intro.mp4", true);

    // Game Board
    this.load.setPath("assets/scenes/game-board");
    this.load.setPrefix("scenes.game-board.");

    this.load.image("category-background", "category-background.png");
    this.load.image("question-background", "question-background.png");
    this.load.image("jeopardy-small-logo", "jeopardy-small-logo.jpg");
    this.load.image("jeopardy-large-logo", "jeopardy-large-logo.jpg");
    this.load.image("background", "background.jpg");
    this.load.image("card", "card.jpg");

    // Choose Question
    this.load.setPath("assets/scenes/choose-question");
    this.load.setPrefix("scenes.choose-question.");

    this.load.image("category-background", "category-background.png");
    this.load.image("question-background", "question-background.png");
    this.load.image("jeopardy-small-logo", "jeopardy-small-logo.jpg");
    this.load.image("jeopardy-large-logo", "jeopardy-large-logo.jpg");
    this.load.image("background", "background.jpg");
    this.load.image("card", "card.jpg");
    this.load.image("category-card", "category-card.webp");
    this.load.image("category-card-hover", "category-card-hover.webp");
    this.load.image("question-card", "question-card.webp");
    this.load.image("question-card-hover", "question-card-hover.webp");

    // Clue Card
    this.load.setPath("assets/scenes/clue-card");
    this.load.setPrefix("scenes.clue-card.");

    this.load.image("background", "background.jpg");
    this.load.image("background-white-spotlight", "background-white-spotlight.jpg");
    this.load.image("header-background", "header-background.webp");
    this.load.image("header-box", "header-box.webp");

    // Hub
    this.load.setPath("assets/scenes/hub");
    this.load.setPrefix("scenes.hub.");

    this.load.image("window", "window.webp");
    this.load.image("left-arrow", "left-arrow.webp");
    this.load.image("up-arrow", "up-arrow.webp");
    this.load.image("down-arrow", "down-arrow.webp");
    this.load.image("right-arrow", "right-arrow.webp");
    this.load.image("ok", "ok.webp");
    this.load.image("mic", "mic.webp");
    this.load.image("back", "back.webp");

    // Input
    this.load.setPath("assets/components/input");
    this.load.setPrefix("components.input.");

    this.load.image("player-card", "player-card.webp");
    this.load.image("icon-podcast", "icon-podcast.webp");

    // Podium
    this.load.setPath("assets/scenes/podium");
    this.load.setPrefix("scenes.podium.");

    this.load.image("card", "card.webp");
    this.load.image("timer-unit", "timer-unit.webp");

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
        // this.scene.launch("hud");
        // this.scene.bringToTop("hud");
        this.fullLoaded.assets = false;
        // this.scene.start("main-menu");
        this.scene.start("game", {
          gameMode: "single-player",
          podiums: [{ name: "Morgan", price: 0 }, { name: "You", price: 0 }, { name: "Jessica", price: 0 }],
        });
        // this.scene.start("game-board");
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
