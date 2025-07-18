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

    const buttonBackground = this.scene.add
      .image(0, 0, "scenes.choose-question.question-card-hover")
      .setName("button-background");
    buttonBackground.setScale(
      fitToSize(
        buttonBackground.displayWidth,
        buttonBackground.displayHeight,
        width,
        height
      ).scale
    );
    const background = this.scene.add
      .image(0, 0, "scenes.clue-card.background")
      .setAlpha(0)
      .setName("background");
    const backgroundWhiteSpotlight = this.scene.add
      .image(0, 0, "scenes.clue-card.background-white-spotlight")
      .setAlpha(0)
      .setName("background-white-spotlight");

    const questionText = this.scene.add
      .text(0, 0, question.question)
      .setFontSize(150)
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

    container.add(buttonBackground);
    container.add(background);
    container.add(backgroundWhiteSpotlight);
    container.add(questionText);

    const headerContainer = this.scene.add
      .container(width / 2, 0)
      .setAlpha(0)
      .setName("header-container");
    const headerBackground = this.scene.rexUI.add
      .ninePatch2({
        width: this.scene.textures.get("scenes.clue-card.header-box").source[0]
          .width,
        height: this.scene.textures.get("scenes.clue-card.header-box").source[0]
          .height,
        key: "scenes.clue-card.header-box",
        columns: [20, undefined, 20],
        rows: [20, undefined, 20],
      })
      .setName("header-background");
    const headerPriceText = this.scene.add
      .text(0, 0, `$${question.price}`)
      .setFontSize(100)
      .setColor("#EABD5E")
      .setOrigin(0)
      .setFontFamily("'Swiss911 XCm BT Regular'")
      .setAlign("center")
      .setShadow(5, 5, "#000000", 20)
      .setWordWrapWidth(width * 0.8)
      .setName("header-price-text");
    const headerSeparator = this.scene.add
      .rectangle(0, 0, 2, 100, 0xffffff)
      .setOrigin(0.5, 0)
      .setName("header-separator");
    const headerCategoryText = this.scene.add
      .text(30, 0, question.category)
      .setFontSize(80)
      .setColor("#ffffff")
      .setOrigin(0)
      .setFontFamily("'Swiss911 XCm BT Regular'")
      .setAlign("center")
      .setShadow(5, 5, "#000000", 20)
      .setWordWrapWidth(width * 0.8)
      .setName("header-category-text");

    headerContainer.add(headerBackground);
    headerContainer.add(headerPriceText);
    headerContainer.add(headerSeparator);
    headerContainer.add(headerCategoryText);
    headerBackground.setOrigin(0.5, 0);

    const paddingX = 30;
    const paddingY = 10;

    headerBackground.resize(
      headerPriceText.displayWidth +
        30 +
        headerSeparator.displayWidth +
        30 +
        headerCategoryText.displayWidth +
        paddingX * 2,
      headerPriceText.displayHeight + paddingY * 2
    );

    const left =
      headerBackground.x - headerBackground.displayWidth / 2 + paddingX;
    const topCenter = headerBackground.y + headerBackground.displayHeight / 2;
    headerPriceText.setPosition(
      left,
      topCenter - headerPriceText.displayHeight / 2
    );
    headerSeparator.setPosition(
      left + headerPriceText.displayWidth + 30,
      topCenter - headerSeparator.displayHeight / 2
    );
    headerCategoryText.setPosition(
      left +
        headerPriceText.displayWidth +
        30 +
        headerSeparator.displayWidth +
        30,
      topCenter - headerCategoryText.displayHeight / 2
    );
  }
}
