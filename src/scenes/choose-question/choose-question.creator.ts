import type GridSizer from "phaser3-rex-plugins/templates/ui/gridsizer/GridSizer";
import { GameCore } from "../../core/game/game-core";
import { fitToSize } from "../../utils/size";
import type { ChooseQuestionScene } from "./choose-question.scene";

const CATEGORIES_AND_QUESTIONS_Y_SEPARATION = 8; // Separation between the categories and the questions.

const CONTAINER_X = 292;
const CONTAINER_Y = 170;
const CONTAINER_WIDTH = 1336;
const CONTAINER_HEIGHT = 672;

export class ChooseQuestionSceneCreator {
  private scene: ChooseQuestionScene;

  constructor(scene: ChooseQuestionScene) {
    this.scene = scene;
  }

  public setup() {
    const { width, height } = this.scene.scale;

    const columns = GameCore.questions.categoriesCount;
    const rows = GameCore.questions.getQuestionsMaxCount();
    const containerWidth = CONTAINER_WIDTH;
    const containerHeight = CONTAINER_HEIGHT;
    const cellWidth = (containerWidth - columns - 1) / columns;
    const cellHeight =
      (containerHeight - rows - 1 - CATEGORIES_AND_QUESTIONS_Y_SEPARATION) /
      (rows + 1); // +1 because of the category cell.

    this.scene.add.image(
      width / 2,
      height / 2,
      "scenes.choose-question.background"
    );

    const container = this.scene.rexUI.add.sizer({
      orientation: "vertical",
      x: CONTAINER_X,
      y: CONTAINER_Y,
      width: containerWidth,
      height: containerHeight,
      space: { item: CATEGORIES_AND_QUESTIONS_Y_SEPARATION },
      origin: 0,
    });

    const categories = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      // We don't need width because this `gridSizer` will be expanded to the full width of the `container`.
      height: cellHeight,
    });

    const questions = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      name: "questions",
    });

    for (const category of GameCore.questions.categories) {
      const categoryLabel = this.createLabel({
        text: category,
        bgKey: "scenes.choose-question.card",
        cellHeight,
        color: "#ffffff",
        fontSize: 32,
        fontFamily: "'Swiss921 BT Regular'",
        wordWrapWidth: cellWidth * 0.8,
      });
      categoryLabel.setName("category");
      categoryLabel.setData("category", category);
      categories.add(categoryLabel);

      const list = this.scene.rexUI.add.gridSizer({
        row: rows,
        column: 1,
        columnProportions: 1,
        rowProportions: 1,
      });
      for (const question of GameCore.questions.getQuestionsByCategory(
        category
      )) {
        const questionLabel = this.createLabel({
          text: `$${question.price}`,
          bgKey: "scenes.choose-question.card",
          cellHeight,
          color: "#EABD5E",
          fontSize: 100,
          fontFamily: "'Swiss911 XCm BT Regular'",
          wordWrapWidth: cellWidth * 0.9,
        });
        questionLabel.setName("question");
        questionLabel.setData("question", question.question);
        questionLabel.setData("category", question.category);
        list.add(questionLabel);
      }
      questions.add(list);
    }

    container.add(categories, { expand: true });
    container.add(questions, { expand: true });
    container.layout();
    // container.drawBounds(this.scene.add.graphics());
  }

  public createCategoryJeopardySmallLogo() {
    const hasCategoryJeopardySmallLogo = this.scene.children.getByName(
      "category-jeopardy-small-logo"
    ) as Phaser.GameObjects.Image | undefined;
    if (hasCategoryJeopardySmallLogo) return;

    const categories = this.scene.services.getCategories();
    for (const category of categories) {
      const bounds = category.getBounds();
      this.scene.add
        .image(
          bounds.centerX,
          bounds.centerY,
          "scenes.choose-question.jeopardy-small-logo"
        )
        .setName("category-jeopardy-small-logo");
    }
  }

  public createJeopardyLargeLogo() {
    const hasJeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    if (hasJeopardyLargeLogo) return;
    const jeopardyLargeLogo = this.scene.add
      .image(0, 0, "scenes.choose-question.jeopardy-large-logo")
      .setName("jeopardy-large-logo");
    const graphics = this.scene.add
      .graphics()
      .setName("jeopardy-large-logo-mask")
      .setVisible(false);
    const questions = this.scene.children.getByName("questions") as GridSizer;
    const bounds = questions.getBounds();
    jeopardyLargeLogo.setPosition(bounds.x, bounds.y + bounds.height / 2);
    jeopardyLargeLogo.setScale(
      fitToSize(
        jeopardyLargeLogo.displayWidth,
        jeopardyLargeLogo.displayHeight,
        bounds.width,
        bounds.height,
        { max: true }
      ).scale
    );
    jeopardyLargeLogo.setOrigin(0, 0.5);
    jeopardyLargeLogo.setMask(graphics.createGeometryMask());
  }

  private createLabel({
    text,
    bgKey,
    cellHeight,
    color,
    fontSize,
    fontFamily,
    wordWrapWidth,
  }: CreateLabelOptions) {
    const background = this.scene.add.image(0, 0, bgKey);
    const textObj = this.scene.add
      .text(0, 0, text)
      .setFontSize(fontSize)
      .setColor(color)
      .setOrigin(0.5)
      .setFontFamily(fontFamily)
      .setAlign("center")
      .setWordWrapWidth(wordWrapWidth);

    const label = this.scene.rexUI.add.label({
      background,
      text: textObj,
      height: cellHeight,
      align: "center",
    });
    // this.scene.tweens.add({
    //   targets: [background, textObj],
    //   props: {
    //     scale: { from: 0.0, to: 1.0 },
    //   },
    //   duration: 100,
    // });
    return label;
  }
}

interface CreateLabelOptions {
  text: string;
  bgKey: string;
  cellHeight: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  wordWrapWidth: number;
}
