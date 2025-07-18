import type Label from "phaser3-rex-plugins/templates/ui/label/Label";
import type { GameBoardScene } from "./game-board.scene";
import { GameCore } from "../../core/game/game-core";

export class GameBoardSceneServices {
  private scene: GameBoardScene;

  constructor(scene: GameBoardScene) {
    this.scene = scene;
  }

  public setup() {}

  public getCategory(category: string) {
    return this.scene.children
      .getChildren()
      .find((child) => child.getData("category") === category) as
      | Label
      | undefined;
  }

  public getCategories() {
    return this.scene.children.getAll("name", "category") as Label[];
  }

  // public getQuestion(category: string, question: string) {
  //   return this.scene.children
  //     .getChildren()
  //     .find(
  //       (child) =>
  //         child.getData("category") === category &&
  //         child.getData("question") === question
  //     );
  // }

  public getQuestions() {
    return this.scene.children.getAll("name", "question") as Label[];
  }

  public getQuestionsByCategory(category: string) {
    return this.scene.children
      .getAll("name", "question")
      .filter((label) => label.getData("category") === category) as Label[];
  }

  public enableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0xffffff);
    text.setTint(0xffffff);
    background.setInteractive({ useHandCursor: true });
    background.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.scene.tweens.add({
        targets: background,
        props: {
          alpha: { from: 1.0, to: 0.8 },
        },
        duration: 100,
      });
    });
    background.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.scene.tweens.add({
        targets: background,
        props: {
          alpha: { from: 0.8, to: 1.0 },
        },
        duration: 100,
      });
    });
    background.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const category = label.getData("category");
      const questionText = label.getData("question");
      const question = GameCore.questions.getQuestionByCategoryAndQuestion(
        category,
        questionText
      );
      this.scene.events.emit("question-selected", question, label.getBounds());
    });
  }

  public disableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.disableInteractive(true);
    background.setAlpha(1.0); // Reset alpha because of the tweens in `enableInteraction`.
  }

  public removeInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0x808080);
    text.setTint(0x808080);
    background.removeInteractive(true);
  }

  public disableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.disableInteraction(label);
    }
  }

  public enableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.enableInteraction(label);
    }
  }

  public async startJeopardyLargeLogoAnimation(childrenRemovedCount: number) {
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    const children = this.getQuestions();
    const length = children.length;
    const interval = length / childrenRemovedCount;
    console.log(interval);
    while (children.length > 0) {
      for (let i = 0; i < childrenRemovedCount; i++) {
        const index = Math.floor(Math.random() * children.length);
        children.splice(index, 1);
      }
      this.jeopardyLargeLogoShow(children);
      await new Promise((resolve) => this.scene.time.delayedCall(500, resolve));
    }
  }

  public jeopardyLargeLogoShow(children: Label[]) {
    this.scene.creator.createJeopardyLargeLogo();
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    graphics.clear();
    const border = 4;
    for (const child of children) {
      const bounds = child.getBounds();
      graphics.fillRect(
        bounds.x + border / 2,
        bounds.y + border / 2,
        bounds.width - border,
        bounds.height - border
      );
    }
  }

  public getCategoriesJeopardySmallLogo() {
    return this.scene.children.getAll(
      "name",
      "category-jeopardy-small-logo"
    ) as Phaser.GameObjects.Image[];
  }

  public jeopardySmallLogoShow() {
    this.scene.creator.createCategoryJeopardySmallLogo();
    const categories = this.getCategories();
    for (const category of categories) {
      category.setScale(0, 1);
    }
  }

  public async startJeopardySmallLogoAnimation() {
    const categoriesJeopardySmallLogo = this.getCategoriesJeopardySmallLogo();
    await Promise.all(
      categoriesJeopardySmallLogo.map(
        (categoryJeopardySmallLogo) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: categoryJeopardySmallLogo,
              props: {
                scaleX: { from: 1.0, to: 0.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
    await Promise.all(
      this.getCategories().map(
        (category) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: category,
              props: {
                scaleX: { from: 0.0, to: 1.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
  }
}