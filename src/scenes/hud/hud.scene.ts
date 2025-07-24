import { HudSceneCreator } from "./hud.creator";
import { HudService } from "./hud.service";

export class HudScene extends Phaser.Scene {
  public creator: HudSceneCreator;
  services: HudService;

  constructor() {
    super("hud");
    this.creator = new HudSceneCreator(this);
    this.services = new HudService(this);
  }

  create() {
    console.log("HudScene create");
    this.creator.setup();
    this.services.setup();
  }
}
