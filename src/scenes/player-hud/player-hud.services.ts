import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import type { PlayerHudScene } from "./player-hud.scene";

export class PlayerHudSceneServices {
  private scene: PlayerHudScene;

  constructor(scene: PlayerHudScene) {
    this.scene = scene;
  }

  public setup() {}

  public getContainer() {
    return this.scene.children.getByName("player-hud-container") as Sizer;
  }

  public startEnterAnimation() {
    const container = this.getContainer();
    container.setAlpha(0);
    container.setY();

    return new Promise((resolve) =>
      this.scene.tweens.add({
        targets: container,
        props: {
          alpha: { from: 0, to: 1 },
          y: {
            from: this.scene.scale.height + container.getBounds().height,
            to: this.scene.scale.height,
          },
        },
        duration: 500,
        ease: "Power2",
        onComplete: resolve,
      })
    );
  }
}
