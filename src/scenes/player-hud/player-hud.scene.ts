import { attachAutoReleaseTexturesEventToScene } from "../../utils/optimization";
import { PlayerHudSceneCreator } from "./player-hud.creator";
import { PlayerHudSceneServices } from "./player-hud.services";

export interface PlayerHudSceneData {
  players: {
    number: number;
    name: string;
    price: number;
    isPlayer?: boolean;
    wager?: boolean;
  }[];
}

export class PlayerHudScene extends Phaser.Scene {
  public creator: PlayerHudSceneCreator;
  public services: PlayerHudSceneServices;
  public dataScene!: PlayerHudSceneData;

  constructor() {
    super("player-hud");
    this.creator = new PlayerHudSceneCreator(this);
    this.services = new PlayerHudSceneServices(this);
  }

  init(data: PlayerHudSceneData) {
    this.dataScene = data;
  }

  preload() {
    this.load.setPath("assets/scenes/player-hub");
    this.load.setPrefix("scenes.player-hub.");

    this.load.image(
      "number-background-player",
      "number-background-player.webp"
    );
    this.load.image("card-background", "card-background.webp");
    this.load.image("card-background-player", "card-background-player.webp");
    this.load.image("name-background", "name-background.webp");
    this.load.image("price-background", "price-background.webp");
    this.load.image("price-divider-v", "price-divider-v.webp");
    this.load.image("wager-background", "wager-background.webp");
    this.load.image("number-background", "number-background.webp");
  }

  create() {
    attachAutoReleaseTexturesEventToScene(this, "scenes.player-hub.");
    this.creator.setup();
    this.services.setup();
    this.services.startEnterAnimation();
  }
}
