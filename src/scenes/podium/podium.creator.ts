import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import type { PodiumScene, PodiumSceneData } from "./podium.scene";

export class PodiumSceneCreator {
  scene: PodiumScene;

  constructor(scene: PodiumScene) {
    this.scene = scene;
  }

  public setup(data: PodiumSceneData) {
    const { width } = this.scene.scale;

    const podiums = data.podiums;
    const podiumsContainer = this.scene.rexUI.add.sizer({
      x: width / 2,
      width: width,
      space: { item: 50 },
      originY: 1,
      name: "podiums-container",
    });
    podiumsContainer.addSpace();
    for (const podium of podiums) {
      podiumsContainer.add(this.createPodiumCard(podium));
    }
    podiumsContainer.addSpace();

    podiumsContainer.layout();
  }

  private createPodiumCard(podium: PodiumSceneData["podiums"][number]) {
    const podiumCard = this.scene.rexUI.add.overlapSizer({
      name: "podium-card",
    });
    podiumCard.setData("name", podium.name);

    podiumCard.add(this.scene.add.image(0, 0, "scenes.podium.card"), {
      align: "left-top",
      expand: false,
    });

    // Price
    const priceText = this.scene.add
      .text(0, 0, `$${podium.price}`)
      .setFontSize(40)
      .setFontFamily("'IBMPlexSans-Regular'")
      .setFontStyle("bold");
    podiumCard.add(priceText, {
      align: "left-top",
      expand: false,
      offsetX: 95 + 214 / 2 - priceText.displayWidth / 2,
      offsetY: 52 + 57 / 2 - priceText.displayHeight / 2,
    });

    // Name
    const nameText = this.scene.add
      .text(0, 0, podium.name)
      .setFontSize(80)
      .setFontFamily("'ReenieBeanie-Regular'");
    podiumCard.add(nameText, {
      align: "left-top",
      expand: false,
      offsetX: 95 + 214 / 2 - nameText.displayWidth / 2,
      offsetY: 152 + 137 / 2 - nameText.displayHeight / 2,
    });

    // Timer Units
    // podiumCard.add(this.createTimerUnitContainer(), {
    //   align: "left-top",
    //   expand: false,
    //   offsetX: 72,
    //   offsetY: 17,
    // });
    // podiumCard.setScale(0.5);

    return podiumCard;
  }

  public createTimerUnitContainer(podiumCard: Sizer) {
    const timerUnitContainer = this.scene.rexUI.add.gridSizer({
      width: 259,
      height: 20,
      row: 1,
      column: 9,
      space: { column: 2 },
      name: "timer-unit-container",
    });

    for (let i = 0; i < 9; i++) {
      const timerUnit = this.scene.add
        .image(0, 0, "scenes.podium.timer-unit")
        .setAlpha(0);
      timerUnitContainer.add(timerUnit);
      this.scene.tweens.add({
        targets: timerUnit,
        props: {
          alpha: { from: 0, to: 1 },
          scale: { from: 0, to: 1 },
        },
        duration: 500,
        // delay: 1_000,
        // delay: (i + 1) * 1_000,
      });
    }

    // const tweens: Promise<Phaser.Tweens.Tween>[] = [];
    // for (let i = 0; i < 9; i++) {
    //   const timerUnit = this.scene.add.image(0, 0, "scenes.podium.timer-unit");
    //   timerUnitContainer.add(timerUnit);
    //   tweens.push(
    //     new Promise((resolve) =>
    //       this.tweens.add({
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

    // return timerUnitContainer;
    podiumCard.add(timerUnitContainer, {
      align: "left-top",
      expand: false,
      offsetX: 72,
      offsetY: 17,
    });
    podiumCard.layout();
  }
}
