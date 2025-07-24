import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import type { PodiumScene } from "./podium.scene";

export class PodiumSceneServices {
  private scene: PodiumScene;

  constructor(scene: PodiumScene) {
    this.scene = scene;
  }

  public setup() {}

  public getPodiumsContainer() {
    return this.scene.children.getByName("podiums-container") as Sizer;
  }

  public getPodiumCards() {
    return this.scene.children.getAll("name", "podium-card") as Sizer[];
  }

  public getPodiumCardByName(name: string) {
    return this.getPodiumCards().find((card) => card.getData("name") === name);
  }

  public async startEnterAnimation() {
    const { height } = this.scene.scale;
    const podiumContainer = this.getPodiumsContainer();

    return new Promise((resolve) =>
      this.scene.tweens.add({
        targets: podiumContainer,
        props: {
          scaleY: { from: 0, to: 1 },
          y: {
            from: height + podiumContainer.displayHeight,
            to: height + podiumContainer.displayHeight * 0.35,
          },
        },
        duration: 500,
        onComplete: resolve,
      })
    );
  }

  public async startExitAnimation() {
    const { height } = this.scene.scale;
    const podiumContainer = this.getPodiumsContainer();

    return new Promise((resolve) =>
      this.scene.tweens.add({
        targets: podiumContainer,
        props: {
          scaleY: { from: 1, to: 0 },
          y: {
            from: height + podiumContainer.displayHeight * 0.35,
            to: height + podiumContainer.displayHeight,
          },
        },
        duration: 500,
        onComplete: () => {
          resolve(undefined);
          this.scene.scene.stop();
        },
      })
    );
  }

  public startPodiumTimerUnitAnimation(podiumCard: Sizer) {
    this.scene.creator.createTimerUnitContainer(podiumCard);

    const timerUnitContainer = podiumCard.getByName(
      "timer-unit-container"
    ) as Sizer;

    // const tweens: Promise<Phaser.Tweens.Tween>[] = [];
    const children = timerUnitContainer.sizerChildren;
    // timerUnitAnimation(children, (_child) => {
    // });
    // for (let i = 0; i < children.length; i++) {
    //   const timerUnit = children[i];
      
    //   // timerUnitContainer.add(timerUnit);
    //   tweens.push(
    //     new Promise((resolve) =>
    //       this.scene.tweens.add({
    //         targets: timerUnit,
    //         props: {
    //           alpha: 0,
    //           scale: 0,
    //         },
    //         duration: 1_000,
    //         delay: (i + 1) * 1_000,
    //         onComplete: resolve,
    //       })
    //     )
    //   );
    // }
    // Promise.all(tweens).then(() => {
    //   this.scene.services.startExitAnimation();
    // });
  }
}

function timerUnitAnimation<T>(children: T[], callback?: (child: T) => Promise<void>) {
  let startIndex = 0;
  let endIndex = children.length - 1;
  while (startIndex != endIndex) {
    const child = children[startIndex];
    startIndex++;
    endIndex--;
  }
}
