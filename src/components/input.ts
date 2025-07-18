import type BBCodeText from "phaser3-rex-plugins/plugins/bbcodetext";
import { HUB_SIZER_HEIGHT } from "../scenes/hud/hud.creator";

export class InputComponent {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setup() {
    const { width, height } = this.scene.scale;
    const sizerHeight = 144;

    const sizer = this.scene.rexUI.add.sizer({
      x: width / 2,
      y: height - sizerHeight / 2,
      width,
      height: sizerHeight,
      space: { left: 100, right: 100, item: 10 },
      name: "input-container",
    });

    sizer.addBackground(
      this.scene.rexUI.add.ninePatch2({
        key: "scenes.hub.window",
        columns: [15, undefined, 15],
        rows: [15, undefined, 15],
      })
    );

    sizer.add(this.createVoiceInput());

    sizer.add(this.createTextInput(), { proportion: 1 });

    sizer.add(this.scene.add.image(0, 0, "components.input.player-card"));

    sizer.layout();

    this.scene.tweens.add({
      targets: sizer,
      props: {
        alpha: { from: 0, to: 1 },
        y: height - HUB_SIZER_HEIGHT - sizerHeight / 2,
      },
      duration: 500,
    });
  }

  private createText(text: string) {
    return this.scene.add
      .text(0, 0, text)
      .setFontSize(34)
      .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
      .setColor("#ffffff");
  }

  private createVoiceInput() {
    const sizer = this.scene.rexUI.add.sizer({
      space: { left: 20, right: 20, top: 20, bottom: 20, item: 5 },
    });

    // sizer.addBackground(
    //   this.scene.rexUI.add
    //     .ninePatch2({
    //       key: "scenes.hub.window",
    //       columns: [15, undefined, 15],
    //       rows: [15, undefined, 15],
    //     })
    //     // .setAlpha(0.5)
    // );
    sizer.addBackground(
      this.scene.rexUI.add.roundRectangle({
        radius: 40,
        strokeColor: 0xffffff,
      })
    );

    sizer.add(this.createText("Voice Input"));
    sizer.add(this.scene.add.image(0, 0, "components.input.icon-podcast"), {
      align: "center",
    });

    return sizer;
  }

  private createTextInput() {
    const sizer = this.scene.rexUI.add.sizer({
      space: { left: 20, right: 20, top: 20, bottom: 20 },
    });

    // const background = this.scene.rexUI.add
    //   .ninePatch2({
    //     key: "scenes.hub.window",
    //     columns: [15, undefined, 15],
    //     rows: [15, undefined, 15],
    //   })
    //   .setAlpha(0.5);
    const background = this.scene.rexUI.add.roundRectangle({
      radius: 40,
      strokeColor: 0xffffff,
    });
    sizer.addBackground(background);
    background.setInteractive();

    const placeholder = "Remember to answer in the form of a question";
    // const text = this.createText(placeholder);
    var printText = this.scene.rexUI.add
      .BBCodeText(0, 0, placeholder, {
        fontFamily: "'AtkinsonHyperlegibleNext-Regular'",
        fontSize: "34px",
        fixedWidth: 950,
        valign: "center",
      })
      .setOrigin(0.5);
    sizer.add(printText);
    background.on("pointerdown", () => {
      this.scene.rexUI.edit(printText, {
        type: "text",
        // enterClose: false,
        // onCreate(textObject, inputText) {
        //   console.log("Create inputText, focus = ", inputText.isFocused);
        // },

        // onOpen(textObject, inputText) {
        //   console.log("Open text editor", inputText.node.style);
        // },

        onTextChanged(textObject, text) {
          (textObject as BBCodeText).text = text;
          console.log(`Text: ${text}`);
        },
        // onClose(textObject) {
        //   console.log("Close text editor");
        // },
        selectAll: true,
      });
    });

    return sizer;
  }
}
