import type GridSizer from "phaser3-rex-plugins/templates/ui/gridsizer/GridSizer";
import { GameCore } from "../../core/game/game-core";
import { fitToSize } from "../../utils/size";
import type { NewGameBoardScene } from "./new-game-board.scene";
// import { InputComponent } from "../../components/input";
import { ListeningComponent } from "../../components/listening";

const CATEGORIES_AND_QUESTIONS_Y_SEPARATION = 16; // Separation between the categories and the questions.

const CONTAINER_X = 32;
const CONTAINER_Y = 32;
const CONTAINER_WIDTH = 1920 - 64;
const CONTAINER_HEIGHT = 1080 - 64 - 64;

// Reduced height for game board to make room for other elements
const GAME_BOARD_HEIGHT = CONTAINER_HEIGHT * 1; // Use 70% of container height

export class GameBoardSceneCreator {
  private scene: NewGameBoardScene;
  listeningComponent!: ListeningComponent;

  constructor(scene: NewGameBoardScene) {
    this.scene = scene;
  }

  public setup() {
    const { width, height } = this.scene.scale;

    const columns = GameCore.questions.categoriesCount;
    const rows = GameCore.questions.getQuestionsMaxCount();
    const containerWidth = CONTAINER_WIDTH;
    const containerHeight = CONTAINER_HEIGHT;
    const gameBoardHeight = GAME_BOARD_HEIGHT;
    const cellWidth = (containerWidth - columns - 1) / columns;
    const cellHeight =
      (gameBoardHeight - rows - 1 - CATEGORIES_AND_QUESTIONS_Y_SEPARATION) /
      (rows + 1); // +1 because of the category cell.

    this.scene.add.image(
      width / 2,
      height / 2,
      "scenes.new-game-board.background"
    );

    // Main container that will hold both game board and other elements
    const mainContainer = this.scene.rexUI.add.sizer({
      orientation: 1,
      x: CONTAINER_X,
      y: CONTAINER_Y,
      width: containerWidth,
      height: containerHeight,
      space: { item: 16 }, // Space between game board and other elements
      origin: 0,
    });
    mainContainer.setName("main-container");

    // Container for the game board section
    const gameBoardContainer = this.scene.rexUI.add.sizer({
      orientation: 1,
      width: containerWidth,
      height: gameBoardHeight,
      space: { item: CATEGORIES_AND_QUESTIONS_Y_SEPARATION },
      origin: 0,
    });
    gameBoardContainer.setName("game-board-container");

    const categories = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      // We don't need width because this `gridSizer` will be expanded to the full width of the `container`.
      height: cellHeight,
      space: { column: 8 },
    });

    const questions = this.scene.rexUI.add.gridSizer({
      row: 1,
      column: columns,
      columnProportions: 1,
      rowProportions: 1,
      name: "questions",
      space: { column: 8 },
    });

    for (const category of GameCore.questions.categories) {
      const categoryLabel = this.createLabel({
        text: category,
        bgKey: "scenes.new-game-board.category-background",
        cellHeight,
        color: "#ffffff",
        fontSize: 56,
        fontFamily: "Swiss911 XCm BT Regular",
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
        space: { row: 8, column: 8 },
      });
      for (const question of GameCore.questions.getQuestionsByCategory(
        category
      )) {
        const questionLabel = this.createLabel({
          text: `$${question.price}`,
          bgKey: "scenes.new-game-board.question-background",
          cellHeight,
          color: "#E7C102",
          fontSize: 80,
          fontFamily: "Swiss921 BT Regular",
          wordWrapWidth: cellWidth * 0.9,
        });
        questionLabel.setName("question");
        questionLabel.setData("question", question.question);
        questionLabel.setData("category", question.category);
        list.add(questionLabel);
      }
      questions.add(list);
    }

    const containerSizer = this.scene.rexUI.add.sizer({
      orientation: 1,
      x: CONTAINER_X,
      y: CONTAINER_Y,
      width: containerWidth,
      height: gameBoardHeight,
      space: { item: CATEGORIES_AND_QUESTIONS_Y_SEPARATION, left: 16, right: 16, top: 16, bottom: 16 },
      origin: 0,
    });
    containerSizer.addBackground(this.scene.add.image(0, 0, "scenes.new-game-board.questions-background"));
    containerSizer.add(categories, { expand: true });
    containerSizer.add(questions, { expand: true });
    containerSizer.layout();
    gameBoardContainer.add(containerSizer, { expand: true });
    // gameBoardContainer.drawBounds(this.scene.add.graphics());

    this.scene.tweens.add({
      targets: mainContainer,

      duration: 1000,
      delay: 1000,
    });

    // Add game board container to main container
    mainContainer.add(gameBoardContainer, { expand: true });

    /** Listeningcomponent */
    this.listeningComponent = new ListeningComponent(this.scene);
    this.listeningComponent.setup();
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
          "scenes.game-board.jeopardy-small-logo"
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
      .image(0, 0, "scenes.game-board.jeopardy-large-logo")
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
    roundedBackground = false,
  }: CreateLabelOptions) {
    // const background = this.scene.add.image(0, 0, bgKey);
    let background: any;
    if (roundedBackground) {
      background = this.scene.rexUI.add.roundRectangle(
        {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          color: 0xF1F1F1,
          alpha: 0.08,
          radius: 8,
        }
      );
    } else {
      background = this.scene.add.image(0, 0, bgKey);
    }

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
  roundedBackground?: boolean;
}