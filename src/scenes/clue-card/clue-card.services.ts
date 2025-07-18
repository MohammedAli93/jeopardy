import type { ClueCardScene } from "./clue-card.scene";

export class ClueCardServices {
  scene: ClueCardScene;

  constructor(scene: ClueCardScene) {
    this.scene = scene;
  }

  public setup() {}

  public getBackground() {
    const container = this.scene.children.getByName(
      "clue-card-container"
    ) as Phaser.GameObjects.Container;
    return container.getByName("background") as Phaser.GameObjects.Image;
  }

  public getBackgroundWhiteSpotlight() {
    const container = this.scene.children.getByName(
      "clue-card-container"
    ) as Phaser.GameObjects.Container;
    return container.getByName(
      "background-white-spotlight"
    ) as Phaser.GameObjects.Image;
  }

  public disappearSnapshot() {
    const snapshot = this.scene.children.getByName(
      "snapshot-choose-question"
    ) as Phaser.GameObjects.Image;
    snapshot.destroy();
    this.scene.textures.remove("snapshot-choose-question");
  }

  public async startZoomInAnimation() {
    const container = this.scene.children.getByName(
      "clue-card-container"
    ) as Phaser.GameObjects.Container;
    const buttonBackground = container.getByName(
      "button-background"
    ) as Phaser.GameObjects.Image;
    const background = container.getByName(
      "background"
    ) as Phaser.GameObjects.Image;
    return Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: container,
          props: {
            scale: 1,
            x: this.scene.scale.width / 2,
            y: this.scene.scale.height / 2,
          },
          duration: 700,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: buttonBackground,
          props: {
            alpha: { from: 1, to: 0 },
            displayWidth: {
              from: buttonBackground.displayWidth,
              to: background.displayWidth,
            },
            displayHeight: {
              from: buttonBackground.displayHeight,
              to: background.displayHeight,
            },
          },
          duration: 700,
          onComplete: () => {
            buttonBackground.destroy();
            resolve(undefined);
          },
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: background,
          props: {
            alpha: { from: 0, to: 1 },
          },
          delay: 600,
          duration: 100,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startBackgroundToWhiteBackgroundAnimation() {
    const background = this.getBackground();
    const backgroundWhiteSpotlight = this.getBackgroundWhiteSpotlight();
    console.log("backgroundWhiteSpotlight", backgroundWhiteSpotlight);
    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: background,
          props: {
            alpha: { from: 1, to: 0 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: backgroundWhiteSpotlight,
          props: {
            alpha: { from: 0, to: 1 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startWhiteBackgroundToBackgroundAnimation() {
    const background = this.getBackground();
    const backgroundWhiteSpotlight = this.getBackgroundWhiteSpotlight();
    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: background,
          props: {
            alpha: { from: 0, to: 1 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: backgroundWhiteSpotlight,
          props: {
            alpha: { from: 1, to: 0 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startShowHeaderAnimation() {
    const headerContainer = this.scene.children.getByName(
      "header-container"
    ) as Phaser.GameObjects.Container;
    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerContainer,
          props: {
            alpha: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            y: { from: 0, to: headerContainer.getBounds().height / 2 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startHideHeaderAnimation() {
    const headerContainer = this.scene.children.getByName(
      "header-container"
    ) as Phaser.GameObjects.Container;
    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerContainer,
          props: {
            alpha: { from: 1, to: 0 },
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startQuestionTextAnimation(direction: "bottom" | "top") {
    const container = this.scene.children.getByName(
      "clue-card-container"
    ) as Phaser.GameObjects.Container;
    const questionText = container.getByName(
      "question-text"
    ) as Phaser.GameObjects.Text;
    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: questionText,
          props: {
            originY:
              direction === "bottom"
                ? { from: 0.5, to: 0.25 }
                : { from: 0.25, to: 0.75 },
          },
          onUpdate: (_tween, _object, property, value, _previousValue) => {
            if (property === "originY") {
              questionText.setOrigin(0.5, value);
            }
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startExpandHeaderAnimation() {
    const headerContainer = this.scene.children.getByName(
      "header-container"
    ) as Phaser.GameObjects.Container;
    const headerBackground = headerContainer.getByName(
      "header-background"
    ) as Phaser.GameObjects.Image;
    const headerPriceText = headerContainer.getByName(
      "header-price-text"
    ) as Phaser.GameObjects.Text;
    const headerSeparator = headerContainer.getByName(
      "header-separator"
    ) as Phaser.GameObjects.Rectangle;
    const headerCategoryText = headerContainer.getByName(
      "header-category-text"
    ) as Phaser.GameObjects.Text;

    const headerBackgroundWidth =
      headerPriceText.displayWidth * 2 +
      30 +
      headerSeparator.displayWidth +
      30 +
      headerCategoryText.displayWidth * 1.25;
    console.log(headerBackgroundWidth);

    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerBackground,
          props: {
            displayWidth: headerBackgroundWidth,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerPriceText,
          props: {
            x: `-=${
              headerBackgroundWidth / 2 - headerPriceText.displayWidth - 30
            }`,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerSeparator,
          props: {
            x: `-=${
              headerBackgroundWidth / 2 - headerPriceText.displayWidth * 2
            }`,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerCategoryText,
          props: {
            x: `-=${
              headerBackgroundWidth / 2 -
              headerPriceText.displayWidth * 2 +
              headerSeparator.displayWidth
            }`,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }

  public async startCollapseHeaderAnimation() {
    const headerContainer = this.scene.children.getByName(
      "header-container"
    ) as Phaser.GameObjects.Container;
    const headerBackground = headerContainer.getByName(
      "header-background"
    ) as Phaser.GameObjects.Image;
    const headerPriceText = headerContainer.getByName(
      "header-price-text"
    ) as Phaser.GameObjects.Text;
    const headerSeparator = headerContainer.getByName(
      "header-separator"
    ) as Phaser.GameObjects.Rectangle;
    const headerCategoryText = headerContainer.getByName(
      "header-category-text"
    ) as Phaser.GameObjects.Text;

    const headerBackgroundWidth = headerPriceText.displayWidth * 2;

    await Promise.all([
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerBackground,
          props: {
            displayWidth: headerBackgroundWidth,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerPriceText,
          props: {
            x: 0,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerSeparator,
          props: {
            x: 0,
            alpha: 0,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
      new Promise((resolve) =>
        this.scene.tweens.add({
          targets: headerCategoryText,
          props: {
            x: 0,
            alpha: 0,
          },
          duration: 500,
          onComplete: resolve,
        })
      ),
    ]);
  }
}
