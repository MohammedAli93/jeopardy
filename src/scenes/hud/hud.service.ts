import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import type { HudScene } from "./hud.scene";
import { HUB_SIZER_HEIGHT } from "./hud.creator";

export class HudService {
  private scene: HudScene;
  micEnabled: boolean;
  isShown: boolean;
  private animationPromise?: Promise<void>;

  constructor(scene: HudScene) {
    this.scene = scene;
    this.micEnabled = false;
    this.isShown = false;
    console.log('HudService initialized with isShown:', this.isShown);
  }

  public setup() {
    this.setupButtonsInteraction();
  }

  private setupButtonsInteraction() {
    /** Back Button Interaction */
    const backButton = this.scene.children.getByName("back-button") as Phaser.GameObjects.Image;
    backButton.setInteractive({ useHandCursor: true });
    backButton.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.scene.tweens.add({
        targets: backButton,
        props: {
          scaleX: 1.1,
          scaleY: 1.1,
        },
        duration: 100,
      });
    });
    backButton.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.scene.tweens.add({
        targets: backButton,
        props: {
          scaleX: 1,
          scaleY: 1,
        },
        duration: 100,
      });
    });
    backButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // Let the state manager handle the transition
      this.scene.game.events.emit("back-button-clicked");
    });

    /** Mic Button Interaction */
    const micButton = this.scene.children.getByName("mic-button") as Phaser.GameObjects.Image;
    micButton.setInteractive({ useHandCursor: true });
    micButton.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.scene.tweens.add({
        targets: micButton,
        props: {
          scaleX: 1.1,
          scaleY: 1.1,
        },
        duration: 100,
      });
    });
    micButton.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.scene.tweens.add({
        targets: micButton,
        props: {
          scaleX: 1,
          scaleY: 1,
        },
        duration: 100,
      });
    });
    micButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // Toggle mic state and emit appropriate event
      this.micEnabled = !this.micEnabled;
      if (this.micEnabled) {
        this.scene.game.events.emit("mic-enable");
      } else {
        this.scene.game.events.emit("mic-disable");
      }
    });
  }
  
  public async showHud(): Promise<void> {
    if (this.isShown || this.animationPromise) {
      console.log('HUD show skipped - isShown:', this.isShown, 'animationPromise:', !!this.animationPromise);
      return this.animationPromise;
    }

    console.log('Starting HUD show animation');
    this.isShown = true;
    const { height } = this.scene.scale;
    const hud = this.scene.children.getByName("hud") as Sizer;
    const originalY = height - HUB_SIZER_HEIGHT / 2;

    // this.animationPromise = new Promise<void>((resolve) => {
    //   this.scene.tweens.add({
    //     targets: hud,
    //     props: {
    //       alpha: { from: 0.5, to: 1 },
    //       y: { from: hud.y + HUB_SIZER_HEIGHT, to: originalY},
    //     },
    //     duration: 500,
    //     ease: 'Power2',
    //     onComplete: () => {
    //       this.animationPromise = undefined;
    //       resolve();
    //     }
    //   });
    // });
    hud.setAlpha(1);
    hud.y = originalY;

    return this.animationPromise;
  }

  public async hideHud(): Promise<void> {
    if (!this.isShown || this.animationPromise) {
      console.log('HUD hide skipped - isShown:', this.isShown, 'animationPromise:', !!this.animationPromise);
      return this.animationPromise;
    }

    console.log('Starting HUD hide animation');
    this.isShown = false;
    const { height } = this.scene.scale;
    const hud = this.scene.children.getByName("hud") as Sizer;
    const originalY = height - HUB_SIZER_HEIGHT / 2;

    this.animationPromise = new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: hud,
        props: {
          y: { from: originalY, to: originalY + HUB_SIZER_HEIGHT  },
        },
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.animationPromise = undefined;
          // Emit event when hub is hidden to signal other components
          this.scene.game.events.emit("hub-hidden");
          resolve();
        }
      });
    });

    return this.animationPromise;
  }

  public getMicState(): boolean {
    return this.micEnabled;
  }

  public resetMicState(): void {
    this.micEnabled = false;
  }

  public getIsShown(): boolean {
    return this.isShown;
  }

  public destroy(): void {
    // Clean up any pending animations
    if (this.animationPromise) {
      this.animationPromise = undefined;
    }
  }
}