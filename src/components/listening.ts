import type BBCodeText from "phaser3-rex-plugins/plugins/bbcodetext";
// import { HUB_SIZER_HEIGHT } from "../scenes/hud/hud.creator";
import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";

export class ListeningComponent {
  private scene: Phaser.Scene;
  private isVisible: boolean = false;
  private animationPromise?: Promise<void>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setup() {
    const { width, height } = this.scene.scale;
    const sizerHeight = 248;

    const sizer = this.scene.rexUI.add.sizer({
      x: width / 2,
      y: height + sizerHeight, // Start off-screen
      originY: 0.5,
      orientation: 1,
      width,
      height: sizerHeight,
      space: { left: 94, right: 94, top: 32, item: 10 },
      name: "listening-container",
    });

    // const background = this.scene.rexUI.add.roundRectangle({
    //   radius: 0,
    //   color: 0xf1f1f1,
    //   alpha: 0.1,
    //   width: width,
    //   height: 152,
    //   x: 0,
    //   y: height - 152,
    // });
    const background = this.scene.add.image(0, 0, "scenes.new-game-board.listening-background");
    // background.setAlpha(0.9);
    sizer.addBackground(background);

    /** Inner container */
    const subsizer = this.scene.rexUI.add.sizer({
      space: { top: 8.5, bottom: 8.5, item: 5 },
      width: 1728,
      name: "listening-inner-container",
    });

    subsizer.addBackground(
      this.scene.rexUI.add.roundRectangle({
        radius: 48,
        strokeColor: 0xf1f1f1,
        strokeWidth: 2,
        strokeAlpha: 0.33,
      })
    );

    subsizer.add(this.createVoiceInput());
    subsizer.add(this.createTextInput(), { proportion: 1 });
    subsizer.add(this.createButtons(), { align: "right" });

    sizer.add(subsizer);
    sizer.layout();
    sizer.setAlpha(0);

    return sizer;
  }

  public async show(): Promise<void> {
    if (this.isVisible || this.animationPromise) {
      console.log('Listening show skipped - isVisible:', this.isVisible, 'animationPromise:', !!this.animationPromise);
      return this.animationPromise;
    }

    console.log('Starting listening show animation');
    this.isVisible = true;
    const { height } = this.scene.scale;
    const sizer = this.scene.children.getByName("listening-container") as Sizer;
    const sizerHeight = 248;

    // this.animationPromise = new Promise<void>((resolve) => {
    //   this.scene.tweens.add({
    //     targets: sizer,
    //     props: {
    //       alpha: { from: 0, to: 1 },
    //       y: { from: height + sizerHeight, to: height - sizerHeight / 2 },
    //     },
    //     duration: 1000,
    //     ease: 'Power2',
    //     onComplete: () => {
    //        this.animationPromise = undefined;
    //        resolve();
    //      }
    //   });
    // });
    sizer.setAlpha(1);
    sizer.y = height - sizerHeight / 2;

    return this.animationPromise;
  }

  public async hide(): Promise<void> {
    if (!this.isVisible || this.animationPromise) {
      console.log('Listening hide skipped - isVisible:', this.isVisible, 'animationPromise:', !!this.animationPromise);
      return this.animationPromise;
    }

    console.log('Starting listening hide animation');
    this.isVisible = false;
    const { height } = this.scene.scale;
    const sizer = this.scene.children.getByName("listening-container") as Sizer;
    const sizerHeight = 248;

    this.animationPromise = new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: [sizer],
        props: {
          alpha: { from: 1, to: 0 },
          y: { from: height - sizerHeight / 2, to: height + sizerHeight },
        },
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.animationPromise = undefined;
          resolve();
        }
      });
    });

    return this.animationPromise;
  }

  public adjustPosition(yOffset: number = 0): void {
    const { height } = this.scene.scale;
    const sizer = this.scene.children.getByName("listening-container") as Sizer;
    const sizerHeight = 248;

    if (sizer && this.isVisible) {
      this.scene.tweens.add({
        targets: sizer,
        props: {
          y: height - sizerHeight / 2 + yOffset,
        },
        duration: 500,
        ease: 'Power2'
      });
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public destroy() {
    // Clean up any pending animations
    if (this.animationPromise) {
      this.animationPromise = undefined;
    }
    
    // Clean up the sizer if it exists
    const sizer = this.scene.children.getByName("listening-container") as Sizer;
    if (sizer) {
      sizer.destroy();
    }
  }

  private createText(text: string, fontSize: number = 34) {
    return this.scene.add
      .text(0, 0, text)
      .setFontSize(fontSize)
      .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
      .setColor("#ffffff");
  }

  private createVoiceInput() {
    const sizer = this.scene.rexUI.add.sizer({
      width: 237,
      space: {},
      name: "listening-voice-input",
    });

    sizer.addBackground(
      this.scene.rexUI.add.roundRectangle({
        radius: 50,
        color: 0xf1f1f1,
        alpha: 0.08,
        strokeColor: 0xf1f1f1,
        strokeAlpha: 0.16,
      })
    );

    sizer.add(this.scene.add.image(0, 0, "scenes.new-game-board.brand-icon"), {
      align: "center",
    });
    sizer.add(this.createText("Listening...", 24));

    return sizer;
  }

  private createTextInput() {
    const sizer = this.scene.rexUI.add.sizer({
      space: { left: 20, right: 20, top: 20, bottom: 20 },
    });

    const background = this.scene.rexUI.add.roundRectangle({
      radius: 0,
    });
    sizer.addBackground(background);
    background.setInteractive();

    const placeholder = "I'll take Travel and Tourism for $400";
    var printText = this.scene.rexUI.add
      .BBCodeText(0, 0, placeholder, {
        fontFamily: "'AtkinsonHyperlegibleNext-Regular'",
        fontSize: "24px",
        fixedWidth: 950,
        valign: "center",
      })
      .setOrigin(0.5);
    sizer.add(printText);
    background.on("pointerdown", () => {
      this.scene.rexUI.edit(printText, {
        type: "text",
        onTextChanged(textObject, text) {
          (textObject as BBCodeText).text = text;
          console.log(`Text: ${text}`);
        },
        selectAll: true,
      });
    });

    return sizer;
  }

  private createButtons() {
    const sizer = this.scene.rexUI.add.sizer({
      space: { left: 20, right: 20, top: 20, bottom: 20, item: 10 },
    });

    // Close button
    const closeButton = this.scene.add.image(0, 0, "scenes.new-game-board.close-icon");
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => {
      // Emit mic-disable to close listening mode
      this.scene.game.events.emit('mic-disable');
    });

    // OK button  
    const okButton = this.scene.add.image(0, 0, "scenes.new-game-board.ok-icon");
    okButton.setInteractive({ useHandCursor: true });
    okButton.on('pointerdown', () => {
      // Handle OK button action - could process the input text
      console.log('OK button clicked');
      // For now, just close listening mode
      this.scene.game.events.emit('mic-disable');
    });

    sizer.add(closeButton);
    sizer.add(okButton);

    return sizer;
  }
}
