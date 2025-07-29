import type Label from "phaser3-rex-plugins/templates/ui/label/Label";
import type { NewGameBoardScene } from "./new-game-board.scene";
import { GameCore } from "../../core/game/game-core";

export class GameBoardSceneServices {
  private scene: NewGameBoardScene;
  transitionState: 'hub' | 'full' | 'listening' | 'listening-hub';

  constructor(scene: NewGameBoardScene) {
    this.scene = scene;
    this.transitionState = 'full';
  }

  public setup() {}

  public getCategory(category: string) {
    return this.scene.children
      .getChildren()
      .find((child) => child.getData("category") === category) as
      | Label
      | undefined;
  }

  public getCategories() {
    return this.scene.children.getAll("name", "category") as Label[];
  }

  // public getQuestion(category: string, question: string) {
  //   return this.scene.children
  //     .getChildren()
  //     .find(
  //       (child) =>
  //         child.getData("category") === category &&
  //         child.getData("question") === question
  //     );
  // }

  public getQuestions() {
    return this.scene.children.getAll("name", "question") as Label[];
  }

  public getQuestionsByCategory(category: string) {
    return this.scene.children
      .getAll("name", "question")
      .filter((label: Phaser.GameObjects.GameObject) => label.getData("category") === category) as Label[];
  }

  public enableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0xffffff);
    text.setTint(0xffffff);
    background.setInteractive({ useHandCursor: true });
    background.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.scene.tweens.add({
        targets: background,
        props: {
          alpha: { from: 1.0, to: 0.8 },
        },
        duration: 100,
      });
    });
    background.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.scene.tweens.add({
        targets: background,
        props: {
          alpha: { from: 0.8, to: 1.0 },
        },
        duration: 100,
      });
    });
    background.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const category = label.getData("category");
      const questionText = label.getData("question");
      const question = GameCore.questions.getQuestionByCategoryAndQuestion(
        category,
        questionText
      );
      this.scene.events.emit("question-selected", question, label.getBounds());
    });
  }

  public disableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.disableInteractive(true);
    background.setAlpha(1.0); // Reset alpha because of the tweens in `enableInteraction`.
  }

  public removeInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0x808080);
    text.setTint(0x808080);
    background.removeInteractive(true);
  }

  public disableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.disableInteraction(label);
    }
  }

  public enableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.enableInteraction(label);
    }
  }

  public async startJeopardyLargeLogoAnimation(childrenRemovedCount: number) {
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    const children = this.getQuestions();
    const length = children.length;
    const interval = length / childrenRemovedCount;
    console.log(interval);
    while (children.length > 0) {
      for (let i = 0; i < childrenRemovedCount; i++) {
        const index = Math.floor(Math.random() * children.length);
        children.splice(index, 1);
      }
      this.jeopardyLargeLogoShow(children);
      await new Promise((resolve) => this.scene.time.delayedCall(500, resolve));
    }
  }

  public jeopardyLargeLogoShow(children: Label[]) {
    this.scene.creator.createJeopardyLargeLogo();
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    graphics.clear();
    const border = 4;
    for (const child of children) {
      const bounds = child.getBounds();
      graphics.fillRect(
        bounds.x + border / 2,
        bounds.y + border / 2,
        bounds.width - border,
        bounds.height - border
      );
    }
  }

  public getCategoriesJeopardySmallLogo() {
    return this.scene.children.getAll(
      "name",
      "category-jeopardy-small-logo"
    ) as Phaser.GameObjects.Image[];
  }

  public jeopardySmallLogoShow() {
    this.scene.creator.createCategoryJeopardySmallLogo();
    const categories = this.getCategories();
    for (const category of categories) {
      category.setScale(0, 1);
    }
  }

  public async startJeopardySmallLogoAnimation() {
    const categoriesJeopardySmallLogo = this.getCategoriesJeopardySmallLogo();
    await Promise.all(
      categoriesJeopardySmallLogo.map(
        (categoryJeopardySmallLogo) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: categoryJeopardySmallLogo,
              props: {
                scaleX: { from: 1.0, to: 0.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
    await Promise.all(
      this.getCategories().map(
        (category) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: category,
              props: {
                scaleX: { from: 0.0, to: 1.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
  }

  /**
   * Animates the game board container height expansion/sinking effect
   * @param expand - true to expand, false to sink/collapse
   * @param duration - animation duration in milliseconds
   * @returns Promise that resolves when animation completes
   */
  public async animateGameBoardHeight(type: 'full' | 'hub' | 'listening' | 'listening-hub' = 'full', duration: number = 1000, from?: 'full' | 'hub' | 'listening' | 'listening-hub'): Promise<void> {
    // Get the named containers from the scene
    const mainContainer = this.scene.children.getByName("main-container") as any;
    const gameBoardContainer = this.scene.children.getByName("game-board-container") as any;
    
    if (!mainContainer) {
      console.warn("Main container not found in the scene. Make sure the creator has set the container names.");
      return;
    }

    // Log found containers for debugging
    console.log("Found containers:", { 
      mainContainer: !!mainContainer, 
      gameBoardContainer: !!gameBoardContainer, 
    });

    // Note: This animation works by scaling the main game board container
    // to create an expansion/sinking visual effect similar to the CodePen reference

    // Store original properties to maintain boundaries
    const originalX = mainContainer.x;
    const originalY = mainContainer.y;
    const originalWidth = mainContainer.width;

    const scaleY = type === 'full' ? { from: 0.78, to: 1.0 } : type === 'hub' ? { from: 1.0, to: 0.9 } : { from: 0.9, to: 0.74 };

    if(from === 'listening-hub' && type === 'hub') {
      scaleY.from = 0.74;
      scaleY.to = 0.9;
    } else if(from === 'listening' || from === 'hub' && type === 'listening-hub') {
      scaleY.from = 0.74;
      scaleY.to = 0.76;
    }
    else if(from === 'hub' && type === 'full') {
      scaleY.from = 0.9;
      scaleY.to = 1.0;
    }
    
    // Define font sizes for different types
    const questionFontSize = type === 'full' ? 80 : type === 'hub' ? 80 : 64;
    const categoryFontSize = type === 'full' ? 56 : type === 'hub' ? 56 : 40;

    // Get all elements with specific names and prepare font size transitions
    const fontSizeTargets = new Map(); // Store initial and target font sizes
    let elementCount = 0;
    
    // Get all category and question labels
    this.scene.children.list.forEach((child: any) => {
      if (child.name === "category" || child.name === "question") {
        elementCount++;
        
        // Store current and target font sizes for smooth transition
        let textObj: Phaser.GameObjects.Text | null = null;
        if ((child as any).text instanceof Phaser.GameObjects.Text) {
          textObj = (child as any).text;
        } else if ((child as any).getElement && (child as any).getElement('text')) {
          textObj = (child as any).getElement('text');
        } else if ((child as any).childrenMap && (child as any).childrenMap.text) {
          textObj = (child as any).childrenMap.text;
        }
        
        if (textObj instanceof Phaser.GameObjects.Text) {
          const currentSize = typeof textObj.style.fontSize === 'string' 
            ? parseInt(textObj.style.fontSize.replace('px', '')) 
            : textObj.style.fontSize;
          
          const targetSize = child.name === 'question' ? questionFontSize : categoryFontSize;
          
          fontSizeTargets.set(child, {
            from: currentSize,
            to: targetSize,
            textObj: textObj
          });
        }
      }
    });
    
    console.log("Found named elements:", elementCount, "elements found");

    // Create the height expansion/sinking animation
    return new Promise((resolve) => {
      // Create a simple scale animation for the expansion/sinking effect
      this.scene.tweens.add({
        targets: mainContainer,
        props: {
          // Animate scale for the expansion/sinking visual effect
          scaleY: scaleY
        },
        duration: duration,
        ease: 'Power2',
        onUpdate: (tween: any) => {
          // Maintain original X position and width to prevent extending out of screen
          // mainContainer.x = originalX;
          // mainContainer.width = originalWidth;
          
          // // Animate text font sizes smoothly during transition
          // const progress = tween.progress;
          // fontSizeTargets.forEach((fontData, _element) => {
          //   if (fontData && fontData.textObj) {
          //     // Smoothly interpolate between current and target font size
          //     const currentFontSize = Math.round(
          //       fontData.from + (fontData.to - fontData.from) * progress
          //     );
          //     fontData.textObj.setFontSize(currentFontSize);
          //   }
          // });
          
          // Re-layout the main container during animation if it has layout method
          if (mainContainer && typeof mainContainer.layout === 'function') {
            // mainContainer.layout();
          }
        },
        onComplete: () => {
          // Ensure final properties are restored to original values
          mainContainer.x = originalX;
          mainContainer.y = originalY;
          mainContainer.width = originalWidth;
          
          // Set final font sizes
          fontSizeTargets.forEach((fontData, _element) => {
            if (fontData && fontData.textObj) {
              fontData.textObj.setFontSize(fontData.to);
            }
          });
          
          // Ensure final layout is correct
          if (mainContainer && typeof mainContainer.layout === 'function') {
            // mainContainer.layout();
          }
          resolve();
        }
      });
    });
  }



  /**
   * Expands the game board container to full height
   * @param duration - animation duration in milliseconds
   */
  public async animateToFull(duration: number = 1000, from?: 'full' | 'hub' | 'listening'): Promise<void> {
    return this.animateGameBoardHeight('full', duration, from);
  }

  /**
   * Collapses/sinks the game board container height
   * @param duration - animation duration in milliseconds
   */
  public async animateToHub(duration: number = 1000, from?: 'full' | 'hub' | 'listening'): Promise<void> {
    return this.animateGameBoardHeight('hub', duration, from);
  }

  public async animateToListening(duration: number = 1000, from?: 'full' | 'hub' | 'listening'): Promise<void> {
    return this.animateGameBoardHeight('listening', duration, from);
  }

  public async animateToListeningHub(duration: number = 1000, from?: 'full' | 'hub' | 'listening'): Promise<void> {
    return this.animateGameBoardHeight('listening-hub', duration, from);
  }
}