import type Label from "phaser3-rex-plugins/templates/ui/label/Label";
import type { ChooseQuestionScene } from "./choose-question.scene";
import { GameCore } from "../../core/game/game-core";

export class ChooseQuestionServices {
  private scene: ChooseQuestionScene;

  constructor(scene: ChooseQuestionScene) {
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
      this.scene.tweens.add({
        targets: background,
        props: {
          angle: { from: -5, to: 5 },
        },
        yoyo: true,
        repeat: 3,
        duration: 150,
      });
      this.scene.events.emit("question-selected", question);
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
}
