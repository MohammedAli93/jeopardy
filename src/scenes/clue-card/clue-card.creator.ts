import { fitToSize } from "../../utils/size";
import type { ClueCardScene, ClueCardSceneData } from "./clue-card.scene";

export class ClueCardSceneCreator {
  scene: ClueCardScene;

  constructor(scene: ClueCardScene) {
    this.scene = scene;
  }

  public setup({ question, questionBounds }: ClueCardSceneData) {
    const { width, height } = this.scene.scale;

    this.scene.add
      .image(width / 2, height / 2, "snapshot-choose-question")
      .setName("snapshot-choose-question");

    const container = this.scene.add
      .container(
        questionBounds.x + questionBounds.width / 2,
        questionBounds.y + questionBounds.height / 2
      )
      .setName("clue-card-container");

    const background = this.scene.add
      .image(0, 0, "scenes.clue-card.background")
      .setName("background");
    const backgroundWhiteSpotlight = this.scene.add
      .image(0, 0, "scenes.clue-card.background-white-spotlight")
      .setAlpha(0)
      .setName("background-white-spotlight");

    const questionText = this.scene.add
      .text(0, 0, question.question)
      .setFontSize(200)
      .setColor("#ffffff")
      .setOrigin(0.5)
      .setFontFamily("'Swiss 911 Ultra Compressed BT'")
      .setAlign("center")
      .setWordWrapWidth(width * 0.8)
      .setShadow(10, 10, "#000000", 0.5)
      .setName("question-text");

    container.setScale(
      fitToSize(
        background.displayWidth,
        background.displayHeight,
        questionBounds.width,
        questionBounds.height,
        { max: true }
      ).scale
    );

    container.add(background);
    container.add(backgroundWhiteSpotlight);
    container.add(questionText);

    const headerContainer = this.scene.add
      .container(width / 2, 250)
      .setAlpha(0)
      .setName("header-container");
    const headerBackground = this.scene.add
      .image(0, 0, "scenes.clue-card.header-background")
      .setName("header-background");
    const headerPriceText = this.scene.add
      .text(0, 0, `$${question.price}`)
      .setFontSize(100)
      .setColor("#EABD5E")
      .setOrigin(0.5, 1.15)
      .setFontFamily("'Swiss911 XCm BT Regular'")
      .setAlign("center")
      .setShadow(5, 5, "#000000", 20)
      .setWordWrapWidth(width * 0.8)
      .setName("header-price-text");
    headerBackground.displayWidth = fitToSize(
      headerBackground.displayWidth,
      headerBackground.displayHeight,
      headerPriceText.displayWidth * 2,
      headerPriceText.displayHeight
    ).width;
    const headerSeparator = this.scene.add
      .rectangle(0, 0, 2, 100, 0xffffff)
      .setOrigin(0.5, 1.25)
      .setName("header-separator")
      // .setAlpha(0);
    const headerCategoryText = this.scene.add
      .text(30, 0, question.category)
      // .setAlpha(0)
      .setFontSize(100)
      .setColor("#ffffff")
      .setOrigin(0, 1.15)
      .setFontFamily("'Swiss911 XCm BT Regular'")
      .setAlign("center")
      .setShadow(5, 5, "#000000", 20)
      .setWordWrapWidth(width * 0.8)
      .setName("header-category-text");

    headerContainer.add(headerBackground);
    headerContainer.add(headerPriceText);
    headerContainer.add(headerSeparator);
    headerContainer.add(headerCategoryText);
  }
}
