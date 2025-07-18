import type { HudScene } from "./hud.scene";

export const HUB_SIZER_HEIGHT = 96;

export class HudSceneCreator {
  scene: HudScene;

  constructor(scene: HudScene) {
    this.scene = scene;
  }

  setup() {
    const { width, height } = this.scene.scale;

    const sizer = this.scene.rexUI.add.sizer({
      x: width / 2,
      y: height - HUB_SIZER_HEIGHT / 2,
      width,
      height: HUB_SIZER_HEIGHT,
      space: { left: 100, right: 100, item: 10 },
    });

    sizer.addBackground(
      this.scene.rexUI.add.ninePatch2({
        key: "scenes.hub.window",
        columns: [15, undefined, 15],
        rows: [15, undefined, 15],
      })
    );

    sizer.add(this.createText("Remote Controls"));

    sizer.addSpace();

    sizer.add(this.createText("Navigation"));
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.left-arrow"));
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.up-arrow"));
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.down-arrow"));
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.right-arrow"));

    sizer.add(this.createText("Accept"), { padding: { left: 50 } });
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.ok"));

    sizer.add(this.createText("Mic"), { padding: { left: 50 } });
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.mic"));

    sizer.add(this.createText("Back"), { padding: { left: 50 } });
    sizer.add(this.scene.add.image(0, 0, "scenes.hub.back"));

    sizer.layout();
  }

  private createText(text: string) {
    return (
      this.scene.add
        .text(0, 0, text)
        .setFontSize(34)
        // .setFontFamily("'Swiss 911 Ultra Compressed BT'")
        .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
        .setColor("#ffffff")
    );
  }
}
