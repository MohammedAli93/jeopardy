import { GameCore } from "../../core/game/game-core";
import type { ChooseQuestionScene } from "./choose-question.scene";

const MARGIN = 30; // Margin between the container and the edges of the screen.
const CELL_PADDING = 10; // Padding between the cells.
const CATEGORIES_AND_QUESTIONS_Y_SEPARATION = 20; // Separation between the categories and the questions.

export class ChooseQuestionSceneCreator {
  private scene: ChooseQuestionScene;

  constructor(scene: ChooseQuestionScene) {
    this.scene = scene;
  }

  public setup() {
    const { width, height } = this.scene.scale;

    const columns = GameCore.questions.categoriesCount;
    const rows = GameCore.questions.getQuestionsMaxCount();
    const containerWidth = width - MARGIN * 2;
    const containerHeight = height - MARGIN * 2;
    // const cellWidth = (containerWidth - (columns - 1) * CELL_PADDING) / columns;
    const cellHeight = (containerHeight - (rows - 1) * CELL_PADDING - CATEGORIES_AND_QUESTIONS_Y_SEPARATION) / (rows + 1); // +1 because of the category cell.

    this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000033
    );

    const container = this.scene.rexUI.add.sizer({
      orientation: "vertical",
      x: width / 2,
      y: height / 2,
      width: containerWidth,
      height: containerHeight,
      space: { item: CATEGORIES_AND_QUESTIONS_Y_SEPARATION },
    });

    const categories = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      // We don't need width because this `gridSizer` will be expanded to the full width of the `container`.
      height: cellHeight,
      space: { column: CELL_PADDING },
    });

    const questions = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      space: { column: CELL_PADDING },
    });

    for (const category of GameCore.questions.categories) {
      const Label = this.createLabel({
        text: category,
        bgKey: "scenes.choose-question.category-background",
        cellHeight,
        color: "#ffffff",
        fontSize: 84,
      });
      Label.setName("category");
      Label.setData("category", category);
      categories.add(Label);

      const list = this.scene.rexUI.add.gridSizer({
        row: rows,
        column: 1,
        columnProportions: 1,
        rowProportions: 1,
        space: { row: CELL_PADDING },
      });
      for (const question of GameCore.questions.getQuestionsByCategory(category)) {
        // background.setTint(0x808080);
        // text.setTint(0x808080);
        const label = this.createLabel({
          text: `$${question.price}`,
          bgKey: "scenes.choose-question.question-background",
          cellHeight,
          color: "#ffe137ff",
          fontSize: 96,
        });
        label.setName("question");
        label.setData("question", question.question);
        label.setData("category", question.category);
        list.add(label);
      }
      questions.add(list);
    }

    container.add(categories, { expand: true });
    container.add(questions, { expand: true });
    container.layout();

    // container.drawBounds(this.scene.add.graphics());
  }

  private createLabel({ text, bgKey, cellHeight, color, fontSize }: CreateLabelOptions) {
    const background = this.scene.add.image(0, 0, bgKey);
    const textObj = this.scene.add
      .text(0, 0, text)
      .setFontSize(fontSize)
      .setFontStyle("bold")
      .setColor(color)
      .setOrigin(0.5)
      .setFontFamily("'Swiss 911 Ultra Compressed BT'");

    const label = this.scene.rexUI.add.label({
      background,
      text: textObj,
      height: cellHeight,
      align: "center",
    });
    this.scene.tweens.add({
      targets: [background, textObj],
      props: {
        scale: { from: 0.0, to: 1.0 },
      },
      duration: 100,
    });
    return label;
  }
}

interface CreateLabelOptions {
  text: string;
  bgKey: string;
  cellHeight: number;
  color: string;
  fontSize: number;
}
