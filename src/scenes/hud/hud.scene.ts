import { HudSceneCreator } from "./hud.creator";

export class HudScene extends Phaser.Scene {
  public creator: HudSceneCreator;

  constructor() {
    super("hud");
    this.creator = new HudSceneCreator(this);
  }

  create() {
    console.log("HudScene create");
    this.creator.setup();
  }
}
