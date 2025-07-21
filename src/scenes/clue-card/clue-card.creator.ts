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

  public createInstructionText(text: string, color: string = '#ffffff'): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    return this.scene.add.text(width / 2, height - 150, text, {
      fontSize: '34px',
      color: color,
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('instruction-text');
  }

  public createQuestionDisplay(): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    return this.scene.add.text(width / 2, height - 100, "", {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      wordWrap: { width: width - 200 }
    }).setOrigin(0.5).setName('question-display');
  }

  public createBuzzingTimer(initialTime: string = "8"): Phaser.GameObjects.Text {
    const { width } = this.scene.scale;
    return this.scene.add.text(width - 100, 50, initialTime, {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('buzzing-timer');
  }

  public createAnswerTimer(initialTime: string = "5"): Phaser.GameObjects.Text {
    const { width } = this.scene.scale;
    return this.scene.add.text(width - 100, 50, initialTime, {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('answer-timer');
  }

  public createAnswerInput(): { inputBg: Phaser.GameObjects.Rectangle, prompt: Phaser.GameObjects.Text, inputText: Phaser.GameObjects.Text } {
    const { width, height } = this.scene.scale;
    
    // Create input background
    const inputBg = this.scene.add.rectangle(width / 2, height - 350, 600, 80, 0xffffff, 0.9)
      .setStrokeStyle(4, 0x000000)
      .setName('input-background');
    
    // Create input prompt
    const prompt = this.scene.add.text(width / 2, height - 400, "Enter your answer:", {
      fontSize: '32px',
      color: '#000000',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('answer-prompt');
    
    // Create input field placeholder
    const inputText = this.scene.add.text(width / 2, height - 350, "Type here and press ENTER", {
      fontSize: '24px',
      color: '#666666',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('input-text');

    return { inputBg, prompt, inputText };
  }

  public createResultMessage(text: string, color: string): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    
    // Remove existing messages
    const existingMessage = this.scene.children.getByName('result-message');
    if (existingMessage) {
      existingMessage.destroy();
    }
    
    return this.scene.add.text(width / 2, height - 100, text, {
      fontSize: '28px',
      color: color,
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5).setName('result-message');
  }

  public createPenaltyMessage(text: string): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    return this.scene.add.text(
      width / 2, 
      height - 50, 
      text,
      { fontSize: '32px', color: '#ff0000', fontFamily: "'Swiss 911 Ultra Compressed BT'" }
    ).setOrigin(0.5).setName('penalty-message');
  }

  public createBuzzMessage(text: string): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    return this.scene.add.text(
      width / 2,
      height - 50,
      text,
      { fontSize: '32px', color: '#00ff00', fontFamily: "'Swiss 911 Ultra Compressed BT'" }
    ).setOrigin(0.5).setName('buzz-message');
  }

  public updateInstructionText(text: string, color: string): void {
    const instructionText = this.scene.children.getByName('instruction-text') as Phaser.GameObjects.Text;
    if (instructionText && instructionText.active && this.scene.scene.isActive()) {
      try {
        instructionText.setText(text);
        instructionText.setColor(color);
      } catch (error) {
        console.warn("Error updating instruction text:", error);
      }
    }
  }
}
