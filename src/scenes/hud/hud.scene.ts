import { attachAutoReleaseTexturesEventToScene } from "../../utils/optimization";
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

  preload() {
    // Hub
    this.load.setPath("assets/scenes/hub");
    this.load.setPrefix("scenes.hub.");

    this.load.image("window", "window.webp");
    this.load.image("left-arrow", "left-arrow.webp");
    this.load.image("up-arrow", "up-arrow.webp");
    this.load.image("down-arrow", "down-arrow.webp");
    this.load.image("right-arrow", "right-arrow.webp");
    this.load.image("ok", "ok.webp");
    this.load.image("mic", "mic.webp");
    this.load.image("back", "back.webp");
    this.load.image("background", "background.webp");
  }

  create() {
    console.log("HudScene create");
    attachAutoReleaseTexturesEventToScene(this, "scenes.hub.");
    this.creator.setup();
    this.services.setup();
  }
}
