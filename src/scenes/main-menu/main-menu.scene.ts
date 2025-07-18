// import CurvedPostFX from "../../pipelines/curved-post-fx";

export class MainMenuScene extends Phaser.Scene {
  // private cameraTween?: Phaser.Tweens.Tween;

  constructor() {
    super("main-menu");
  }

  async create() {
    const { width, height } = this.scale;
    this.scene.launch("hud");
    this.scene.bringToTop("hud");

    // Background
    this.add.image(width / 2, height / 2, "scenes.main-menu.background");

    // Title Background
    const titleBackground = this.add.image(
      width / 2,
      height / 2,
      "scenes.main-menu.title-background"
    );
    titleBackground.setAlpha(0);

    const sizer = this.rexUI.add.sizer({
      orientation: "vertical",
      x: width / 2,
      y: titleBackground.y - titleBackground.displayHeight / 2,
      originY: 0,
    });

    // Title
    const title = this.add.image(
      width / 2,
      height / 2,
      "scenes.main-menu.logo"
    );

    // sizer.add(titleBackground);
    sizer.add(title);
    sizer.add(this.createButtonStack());
    sizer.add(this.add.image(0, 0, "scenes.main-menu.divider-h"));
    sizer.add(this.createButtons(), { padding: { top: 10 } });
    sizer.layout();
    sizer.setAlpha(0);

    // Animations
    this.tweens.add({
      targets: sizer,
      delay: 500,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 1.5, to: 1 },
      },
      duration: 500,
    });

    this.tweens.add({
      targets: titleBackground,
      delay: 500,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 0, to: 1 },
      },
      duration: 500,
    });

    // this.cameras.main.setPostPipeline(CurvedPostFX);
    // this.cameras.main.setZoom(1.05);
    // this.cameras.main.setBounds(0, 0, 1920, 1080);

    // [TEMP] We don't have a start button for now, so let's just wait 5 seconds and start the game.
    this.time.delayedCall(500, () => {
      // this.scene.start("game");
    });
  }

  private createButtonStack() {
    const buttonStack = this.add.image(0, 0, "scenes.main-menu.button-stack");
    const sizer = this.rexUI.add.sizer({
      width: buttonStack.displayWidth,
      height: buttonStack.displayHeight,
    });
    sizer.addBackground(
      buttonStack
      // this.rexUI.add.ninePatch2({
      //   key: "scenes.main-menu.button-stack",
      //   columns: [15, undefined, 15],
      //   rows: [15, undefined, 15],
      // })
    );
    // sizer.add(this.add.image(0, 0, "scenes.main-menu.button-stack"));
    sizer.addSpace();
    sizer.add(
      this.createButton("Single Player", 0, () => this.scene.start("game"))
    );
    sizer.add(this.createButton("Multiplayer", 1));
    sizer.add(this.createButton("Records", 2));
    sizer.add(this.createButton("Exit", 3));
    sizer.addSpace();
    return sizer;
  }

  // getPanPositionByIndex(index: number, size: number) {
  //   const restWidth =
  //     this.cameras.main.getBounds().width - this.cameras.main.worldView.width;
  //   const panPosition = (restWidth / (size - 1)) * index;
  //   return this.scale.width / 2 - restWidth / 2 + panPosition;
  // }

  private createButton(text: string, _index: number, callback?: () => void) {
    const sizer = this.rexUI.add.overlapSizer({});
    const button = this.add.image(0, 0, "scenes.main-menu.button");
    const textObj = this.add
      .text(0, 0, text)
      .setFontSize(34)
      .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
      .setColor("#ffffff");

    button.setInteractive({ useHandCursor: true });

    button.on(Phaser.Input.Events.POINTER_OVER, () => {
      button.setTexture("scenes.main-menu.button-hover");
      textObj.setColor("#000000");

      // const targetX = this.getPanPositionByIndex(index, 4);

      // // Kill existing tween if running
      // if (this.cameraTween?.isPlaying()) {
      //   this.cameraTween.stop();
      // }

      // // Tween camera scrollX smoothly
      // this.cameraTween = this.tweens.add({
      //   targets: this.cameras.main,
      //   scrollX: targetX - this.scale.width / 2, // convert to scroll position
      //   duration: 500,
      //   ease: "Cubic.easeOut",
      // });
    });

    button.on(Phaser.Input.Events.POINTER_OUT, () => {
      button.setTexture("scenes.main-menu.button");
      textObj.setColor("#ffffff");

      // Reset camera position
      // if (this.cameraTween?.isPlaying()) {
      //   this.cameraTween.stop();
      // }

      // this.cameraTween = this.tweens.add({
      //   targets: this.cameras.main,
      //   scrollX: 0,
      //   duration: 600,
      //   ease: "Cubic.easeInOut",
      // });
    });

    button.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (callback) callback();
    });

    sizer.add(button, {
      align: "center",
      expand: false,
    });

    sizer.add(textObj, {
      align: "center",
      expand: false,
      offsetY: -10,
    });

    return sizer;
  }

  private createButtons() {
    const sizer = this.rexUI.add.sizer({
      space: { item: 30 },
    });
    sizer.addSpace();
    sizer.add(this.createConfigButton("scenes.main-menu.button-settings"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-saves"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-guides"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-a11y"));
    sizer.addSpace();
    return sizer;
  }

  private createConfigButton(key: string) {
    const sizer = this.rexUI.add.sizer({ orientation: "vertical" });
    const button = this.add.image(0, 0, key).setAlpha(0.9);
    button.setInteractive({ useHandCursor: true });
    button.on(Phaser.Input.Events.POINTER_OVER, () => {
      button.setAlpha(1);
    });
    button.on(Phaser.Input.Events.POINTER_OUT, () => {
      button.setAlpha(0.9);
    });
    sizer.add(button);

    return sizer;
  }
}
