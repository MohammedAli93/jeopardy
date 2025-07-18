import type { Question } from "../../core/game/models/questions.model";
import { ClueCardSceneCreator } from "./clue-card.creator";
import { ClueCardServices } from "./clue-card.services";

export interface ClueCardSceneData {
  question: Question;
  questionBounds: Phaser.Geom.Rectangle;
}

export class ClueCardScene extends Phaser.Scene {
  public creator: ClueCardSceneCreator;
  public services: ClueCardServices;

  constructor() {
    super("clue-card");
    this.creator = new ClueCardSceneCreator(this);
    this.services = new ClueCardServices(this);
  }

  init() {
    console.log("ClueCardScene init");
  }

  async create(data: ClueCardSceneData) {
    console.log("ClueCardScene create");
    this.scene.stop("hud");
    this.creator.setup(data);
    await this.services.startZoomInAnimation();
    this.services.disappearSnapshot();
    await Promise.all([
      this.services.startBackgroundToWhiteBackgroundAnimation(),
      this.services.startShowHeaderAnimation(),
      this.services.startQuestionTextAnimation("bottom"),
    ]);
    // await Promise.all([
    //   this.services.startExpandHeaderAnimation(),
    // ]);
    // await new Promise((resolve) => this.time.delayedCall(1_500, resolve));
    // await this.services.startCollapseHeaderAnimation();
    // await new Promise((resolve) => this.time.delayedCall(500, resolve));
    // await Promise.all([
    //   this.services.startWhiteBackgroundToBackgroundAnimation(),
    //   this.services.startHideHeaderAnimation(),
    //   this.services.startQuestionTextAnimation("top"),
    // ]);
  }
}
