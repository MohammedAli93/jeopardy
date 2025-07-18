import { PodiumSceneCreator } from "./podium.creator";
import { PodiumSceneServices } from "./podium.services";

export interface PodiumSceneData {
  podiums: {
    name: string;
    price: number;
  }[];
}

export class PodiumScene extends Phaser.Scene {
  public creator: PodiumSceneCreator;
  public services: PodiumSceneServices;
  constructor() {
    super("podium");
    this.creator = new PodiumSceneCreator(this);
    this.services = new PodiumSceneServices(this);
  }

  init() {
    console.log("PodiumScene init");
  }

  create(data: PodiumSceneData) {
    console.log("PodiumScene create");
    this.creator.setup(data);
    this.services.setup();
    this.scene.bringToTop();

    this.services.startEnterAnimation().then(() => {
      console.log(this.services.getPodiumCards());
      console.log(this.services.getPodiumCardByName("You"));
      this.services.startPodiumTimerUnitAnimation(this.services.getPodiumCardByName("You")!);
    });
  }
}
