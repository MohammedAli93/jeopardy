import type { Question } from "../../core/game/models/questions.model";

interface ReplyQuestionSceneData {
  question: Question;
}

export class ReplyQuestionScene extends Phaser.Scene {
  public question!: Question;

  constructor() {
    super("reply-question");
  }

  init(data: ReplyQuestionSceneData) {
    console.log("ReplyQuestionScene init", data.question);
    this.question = data.question;
  }

  create() {
    console.log("ReplyQuestionScene create");
    const { width, height } = this.scale;

    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000033
    );

    this.add.text(width / 2, 100, this.question.category).setOrigin(0.5).setFontSize(64);

    this.add.text(width / 2, height / 2, this.question.question).setOrigin(0.5).setFontSize(80).setWordWrapWidth(width * 0.8);
  }
}
