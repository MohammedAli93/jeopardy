import { humanizeNumber } from "../../utils/number";
import type { PlayerHudScene, PlayerHudSceneData } from "./player-hud.scene";

export class PlayerHudSceneCreator {
  private scene: PlayerHudScene;

  constructor(scene: PlayerHudScene) {
    this.scene = scene;
  }

  public setup() {
    const { width, height } = this.scene.scale;

    const container = this.scene.rexUI.add.sizer({
      orientation: "horizontal",
      x: width / 2,
      y: height,
      originY: 1,
      space: { item: 30, bottom: 50 },
      name: "player-hud-container",
    });

    this.scene.dataScene.players.forEach((player) => {
      container.add(this.createCard(player), {
        proportion: 1 / this.scene.dataScene.players.length,
      });
    });

    container.layout();
  }

  private createCard(player: PlayerHudSceneData["players"][number]) {
    const sizer = this.scene.rexUI.add.sizer({
      orientation: "horizontal",
      space: { left: 15, right: 15, top: 15, bottom: 15 },
    });

    sizer.addBackground(
      this.scene.rexUI.add.ninePatch2({
        key: `scenes.player-hub.card-background${
          player.isPlayer ? "-player" : ""
        }`,
        columns: [18, undefined, 18],
        rows: [18, undefined, 18],
      })
    );

    sizer.add(this.createNumber(`P${player.number}`, !!player.isPlayer));
    sizer.add(this.createName(player.name), { padding: { left: 7 } });
    sizer.add(this.scene.add.image(0, 0, "scenes.player-hub.price-divider-v"));
    sizer.add(
      this.createPrice(player.price, !!player.wager, !!player.isPlayer)
    );

    sizer.layout();
    return sizer;
  }

  private createNumber(numberText: string, isPlayer: boolean) {
    return this.scene.rexUI.add.label({
      background: this.scene.rexUI.add.ninePatch2({
        key: `scenes.player-hub.number-background${isPlayer ? "-player" : ""}`,
        columns: [10, undefined, 10],
        rows: [10, undefined, 10],
      }),
      text: this.scene.add
        .text(0, 0, numberText)
        .setFontSize(26)
        .setFontFamily("'Swiss 911 Ultra Compressed BT'")
        .setColor("#ffffff"),
      space: { left: 8, right: 8, top: 17, bottom: 17 },
    });
  }

  private createName(nameText: string) {
    return this.scene.rexUI.add.label({
      background: this.scene.rexUI.add.ninePatch2({
        key: "scenes.player-hub.name-background",
        columns: [10, undefined, 10],
        rows: [10, undefined, 10],
      }),
      text: this.scene.add
        .text(0, 0, nameText)
        .setFontSize(30)
        .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
        .setColor("#ffffff"),
      space: { left: 8, right: 8, top: 17, bottom: 17 },
      width: 224,
    });
  }

  private createPrice(price: number, wager: boolean, isPlayer: boolean) {
    const paddingX = isPlayer ? 24 : 8;
    const sizer = this.scene.rexUI.add.sizer({
      orientation: "horizontal",
      height: 66,
      space: { left: paddingX, right: paddingX, item: 8 },
    });

    sizer.addBackground(
      this.scene.rexUI.add.ninePatch2({
        key: "scenes.player-hub.price-background",
        columns: [10, undefined, 10],
        rows: [10, undefined, 10],
      })
    );

    sizer.add(
      this.scene.add
        .text(0, 0, `$${humanizeNumber(price)}`)
        .setFontSize(50)
        .setFontFamily("'Swiss 911 Ultra Compressed BT'")
        .setColor("#ffffff")
    );
    if (wager) {
      sizer.add(this.createWager());
    }

    return sizer;
  }

  private createWager() {
    return this.scene.rexUI.add.label({
      background: this.scene.rexUI.add.ninePatch2({
        key: "scenes.player-hub.wager-background",
        columns: [12, undefined, 12],
        rows: [12, undefined, 12],
      }),
      text: this.scene.add
        .text(0, 0, "Wager Set")
        .setFontSize(22)
        .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
        .setColor("#ffffff"),
      space: { left: 5, right: 5, top: 10, bottom: 10 },
      // width: 224,
    });
  }
}
