// import CurvedPostFX from "../../pipelines/curved-post-fx";

export class MainMenuScene extends Phaser.Scene {
  // private cameraTween?: Phaser.Tweens.Tween;
  private buttons: any[] = [];
  private mousePosition = { x: 0, y: 0 };
  private loading: boolean = true;

  constructor() {
    super("main-menu");
  }

  async create() {
    const { width, height } = this.scale;
    this.scene.launch("hud");
    this.scene.bringToTop("hud");

    // Background with parallax scroll effect
    const backgroundImage = this.add.image(width / 2, height / 2, "scenes.main-menu.background")
    .setName("background-image");
    backgroundImage.setDisplaySize(width * 2, height * 1.8); // Make it wider for scrolling
    backgroundImage.setDepth(-1);


    // Add background to tracking
    // Title Background
    const titleBackground = this.add.image(
      width / 2,
      height / 2,
      "scenes.main-menu.title-background"
    );
    titleBackground.setAlpha(0);

    const sizer = this.rexUI.add.sizer({
      orientation: "vertical",
      x: width / 2,
      y: titleBackground.y - titleBackground.displayHeight / 2,
      originY: 0,
    });

    // Title - Create perspective logo
    const title = this.createPerspectiveLogo();

    // sizer.add(titleBackground);
    sizer.add(title);
    sizer.add(this.createButtonStack());
    sizer.add(this.add.image(0, 0, "scenes.main-menu.divider-h"));
    sizer.add(this.createButtons(), { padding: { top: 10 } });
    sizer.layout();
    sizer.setAlpha(0);

    // Update logo position after layout
    const logoInButtons = this.buttons.find(btn => btn.isLogo);
    if (logoInButtons) {
      logoInButtons.x = title.x;
      logoInButtons.y = title.y;
    }

    // Animations
    this.tweens.add({
      targets: sizer,
      delay: 500,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 1.5, to: 1 },
      },
      duration: 500,
    });

    this.tweens.add({
      targets: titleBackground,
      delay: 500,
      props: {
        alpha: { from: 0, to: 1 },
        scale: { from: 0, to: 1 },
      },
      duration: 500,
    });

    // this.cameras.main.setPostPipeline(CurvedPostFX);
    // this.cameras.main.setZoom(1.05);
    // this.cameras.main.setBounds(0, 0, 1920, 1080);

    // Setup mouse tracking for perspective animation
    this.setupMouseTracking();

    // [TEMP] We don't have a start button for now, so let's just wait 5 seconds and start the game.
    this.time.delayedCall(1500, () => {
      this.loading = false;
    });
  }

  private createButtonStack() {
    const buttonStack = this.add.image(0, 0, "scenes.main-menu.button-stack");
    const sizer = this.rexUI.add.sizer({
      width: buttonStack.displayWidth,
      height: buttonStack.displayHeight,
    });
    sizer.addBackground(
      buttonStack
      // this.rexUI.add.ninePatch2({
      //   key: "scenes.main-menu.button-stack",
      //   columns: [15, undefined, 15],
      //   rows: [15, undefined, 15],
      // })
    );
    // sizer.add(this.add.image(0, 0, "scenes.main-menu.button-stack"));
    sizer.addSpace();
    sizer.add(
      this.createButton("Single Player", 0, () => {
        this.scene.start("game")
      })
    );
    sizer.add(this.createButton("Multiplayer", 1));
    sizer.add(this.createButton("Records", 2));
    sizer.add(this.createButton("Exit", 3));
    sizer.addSpace();
    return sizer;
  }

  // getPanPositionByIndex(index: number, size: number) {
  //   const restWidth =
  //     this.cameras.main.getBounds().width - this.cameras.main.worldView.width;
  //   const panPosition = (restWidth / (size - 1)) * index;
  //   return this.scale.width / 2 - restWidth / 2 + panPosition;
  // }

  private createButton(text: string, index: number, callback?: () => void) {
    // Create text for the button
    const textObj = this.add
      .text(0, 0, text)
      .setFontSize(34)
      .setFontFamily("'AtkinsonHyperlegibleNext-Regular'")
      .setDepth(1)
      .setColor("#ffffff");

    // Get button dimensions from texture
    const buttonTexture = this.textures.get("scenes.main-menu.button");
    const buttonWidth = buttonTexture.source[0].width;
    const buttonHeight = buttonTexture.source[0].height;

    // Create perspective card wrapper using button texture
    const perspectiveCard = this.add.rexPerspectiveCard({
      x: 0,
      y: 0,
      width: buttonWidth,
      height: buttonHeight,
      front: {
        key: "scenes.main-menu.button"
      },
      back: {
        key: "scenes.main-menu.button"
      }
    });

    // Set initial rotation to show back face (Y = 180 degrees)
    perspectiveCard.rotateY = Phaser.Math.DegToRad(180);

    // Make perspective card interactive instead of button
    perspectiveCard.setInteractive({ useHandCursor: true });

    // Store button data for tracking
    const buttonObj = {
      card: perspectiveCard,
      text: textObj,
      width: buttonWidth,
      height: buttonHeight,
      isHovered: false,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
      baseAngleY: 180,
      x: 0, // Will be set when positioned
      y: 0, // Will be set when positioned
      callback: callback
    };

    // Add original hover/out/click functionality with perspective animation
    perspectiveCard.on(Phaser.Input.Events.POINTER_OVER, () => {
      buttonObj.isHovered = true;
      // Just change text color and add scale effect for hover feedback
      perspectiveCard.backFace.setTexture("scenes.main-menu.button-hover");
      perspectiveCard.angleY = 180;
      textObj.setColor("#000000"); // black text for hover
      this.tweens.add({
        targets: [perspectiveCard, textObj],
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 200,
        ease: 'Power2'
      });
    });

    perspectiveCard.on(Phaser.Input.Events.POINTER_OUT, () => {
      buttonObj.isHovered = false;
      // Reset text color and scale
      textObj.setColor("#ffffff");
      perspectiveCard.backFace.setTexture("scenes.main-menu.button");
      this.tweens.add({
        targets: [perspectiveCard, textObj],
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
      
      // Reset rotation when not hovering
      buttonObj.targetRotationX = 0;
      buttonObj.targetRotationY = 0;
    });

    perspectiveCard.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // Store the clicked button's position
      const targetX = perspectiveCard.x;
      const targetY = perspectiveCard.y;

      // Bring clicked button to front
      perspectiveCard.setDepth(1000);
      textObj.setDepth(1001);

      // Add highlight animation for clicked button
      this.tweens.add({
        targets: [perspectiveCard, textObj],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });

      // Make other buttons stack on the clicked button
      let stackDelay = 0;
      this.buttons.forEach(btn => {
        if (btn !== buttonObj && !btn.isLogo) {
          // Set lower depth for stacking effect
          btn.card.setDepth(100);
          btn.text.setDepth(101);

          // Stack animation
          this.tweens.add({
            targets: [btn.card, btn.text],
            x: targetX,
            y: targetY,
            scaleX: 0.95,
            scaleY: 0.95,
            alpha: 0.6,
            duration: 300,
            delay: stackDelay,
            ease: 'Power2',
            onComplete: () => {
              // Return to original position
              btn.card.setDepth(0).setAlpha(0);
              btn.text.setDepth(0).setAlpha(0);
              // this.tweens.add({
              //   targets: [btn.card, btn.text],
              //   x: btn.x,
              //   y: btn.y,
              //   scaleX: 1,
              //   scaleY: 1,
              //   alpha: 1,
              //   duration: 300,
              //   delay: 200,
              //   ease: 'Back.easeOut',
              //   onComplete: () => {
              //     // Reset depths
              //     btn.card.setDepth(0);
              //     btn.text.setDepth(1);
              //   }
              // });
            }
          });
          
          stackDelay += 50; // Stagger the animations
        }
      });

      // Reset clicked button
      this.time.delayedCall(800, () => {
        this.tweens.add({
          targets: [perspectiveCard, textObj],
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            perspectiveCard.setDepth(0);
            textObj.setDepth(1);
            if (callback) callback();
          }
        });
      });

      
    });

    this.buttons.push(buttonObj);

    // Create sizer with original structure
    const sizer = this.rexUI.add.overlapSizer({});
    
    sizer.add(perspectiveCard, {
      align: "center",
      expand: false,
    });

    sizer.add(textObj, {
      align: "center",
      expand: false,
      offsetY: -10,
    });

    // Store reference to update position later for mouse tracking
    sizer.on('sizer.postlayout', () => {
      buttonObj.x = sizer.x;
      buttonObj.y = sizer.y;
    });

    return sizer;
    }

  private createPerspectiveLogo() {
    // Get logo dimensions from texture
    const logoTexture = this.textures.get("scenes.main-menu.logo");
    const logoWidth = logoTexture.source[0].width;
    const logoHeight = logoTexture.source[0].height;

    // Create perspective card wrapper using logo texture
    const perspectiveLogo = this.add.rexPerspectiveCard({
      x: 0,
      y: 0,
      width: logoWidth,
      height: logoHeight,
      front: {
        key: "scenes.main-menu.logo"
      },
      back: {
        key: "scenes.main-menu.logo"
      }
    });

    // Set initial rotation to show back face (Y = 180 degrees)
    perspectiveLogo.rotateY = Phaser.Math.DegToRad(180);

    // Store logo data for tracking
    const logoObj = {
      card: perspectiveLogo,
      width: logoWidth,
      height: logoHeight,
      isHovered: false,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
      baseAngleY: 180,
      x: 0, // Will be set when positioned
      y: 0, // Will be set when positioned
      isLogo: true // Flag to identify this as the logo
    };

    // Add logo to buttons array for tracking
    this.buttons.push(logoObj);

    return perspectiveLogo;
  }

  private createButtons() {
    const sizer = this.rexUI.add.sizer({
      space: { item: 30 },
    });
    sizer.addSpace();
    sizer.add(this.createConfigButton("scenes.main-menu.button-settings"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-saves"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-guides"));
    sizer.add(this.createConfigButton("scenes.main-menu.button-a11y"));
    sizer.addSpace();
    return sizer;
  }

  private createConfigButton(key: string) {
    const sizer = this.rexUI.add.sizer({ orientation: "vertical" });
    const button = this.add.image(0, 0, key).setAlpha(0.9);
    button.setInteractive({ useHandCursor: true });
    button.on(Phaser.Input.Events.POINTER_OVER, () => {
      button.setAlpha(1);
    });
    button.on(Phaser.Input.Events.POINTER_OUT, () => {
      button.setAlpha(0.9);
    });
    sizer.add(button);

    return sizer;
  }



  private setupMouseTracking() {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePosition.x = pointer.x;
      this.mousePosition.y = pointer.y;
    });
  }

  update() {
    // Update background position based on mouse position
    const backgroundImage = this.children.getByName("background-image") as Phaser.GameObjects.Image;
    if (backgroundImage && !this.loading) {
      const screenWidth = Number(this.scale.width) || Number(this.game.config.width) || 1920;
      const mouseX = Phaser.Math.Clamp(this.mousePosition.x, 0, screenWidth);
      
      // Calculate the scroll offset based on mouse position
      // mouseX ranges from 0 to screenWidth, we want to move the background by a maximum of width/2 in either direction
      const scrollRange = screenWidth / 4; // How far the background can move from center
      const scrollOffset = ((mouseX / screenWidth) - 0.5) * scrollRange * 2;
      
      // Smoothly update the background position
      const currentX = backgroundImage.x;
      const targetX = (screenWidth / 2) + scrollOffset;
      const newX = Phaser.Math.Linear(currentX, targetX, 0.1); // Smooth interpolation
      
      backgroundImage.x = newX;
    }

    // Update global rotation for other elements
    this.updateGlobalCardRotation();
  }

  // Update base Y rotation (160° to 200°) for all cards based on mouse X position across the viewport
  private updateGlobalCardRotation() {
    if(this.loading) return;
    const screenWidth = Number(this.scale.width) || Number(this.game.config.width) || 1920;
    const mouseX = Phaser.Math.Clamp(this.mousePosition.x, 0, screenWidth);
    // Map mouseX (0..screenWidth) to rotation 160..200°
    const newBaseRotationY = 160 + (mouseX / screenWidth) * 40;

    // Update baseRotationY for each button
    this.buttons.forEach(buttonObj => {
      if (buttonObj.card && buttonObj.card.angleY !== undefined && !buttonObj.isHovered) {
        // Apply reduced effect for background
        if (buttonObj.isBackground) {
          // Very subtle rotation for background (only 10% of normal range)
          const reducedRotation = 178 + ((newBaseRotationY - 160) * 0.1);
          buttonObj.card.angleY = reducedRotation;
        } else {
          buttonObj.card.angleY = newBaseRotationY;
        }
      }
    });
  }
}
