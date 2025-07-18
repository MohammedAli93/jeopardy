// import CurvedPostFX from "../../pipelines/curved-post-fx";

export class MainMenuScene extends Phaser.Scene {
  // private cameraTween?: Phaser.Tweens.Tween;
  private buttons: any[] = [];
  private mousePosition = { x: 0, y: 0 };

  constructor() {
    super("main-menu");
  }

  async create() {
    const { width, height } = this.scale;
    this.scene.launch("hud");
    this.scene.bringToTop("hud");



    // Background
    this.add.image(width / 2, height / 2, "scenes.main-menu.background");

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
    this.time.delayedCall(500, () => {
      // this.scene.start("game");
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
      this.createButton("Single Player", 0, () => this.scene.start("game"))
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
      if (callback) callback();
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

    // Make logo interactive for hover effects
    perspectiveLogo.setInteractive({ useHandCursor: false });

    // Add hover effects for logo
    perspectiveLogo.on(Phaser.Input.Events.POINTER_OVER, () => {
      logoObj.isHovered = true;
      // Subtle scale up effect for logo
      this.tweens.add({
        targets: perspectiveLogo,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 300,
        ease: 'Power2'
      });
    });

    perspectiveLogo.on(Phaser.Input.Events.POINTER_OUT, () => {
      logoObj.isHovered = false;
      // Scale back to normal
      this.tweens.add({
        targets: perspectiveLogo,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Power2'
      });
      
      // Reset rotation when not hovering
      logoObj.targetRotationX = 0;
      logoObj.targetRotationY = 0;
    });

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
    // Update global rotation based on mouse X position
    this.updateGlobalCardRotation();
  }

  // Update base Y rotation (160° to 200°) for all cards based on mouse X position across the viewport
  private updateGlobalCardRotation() {
    const screenWidth = Number(this.scale.width) || Number(this.game.config.width) || 1920;
    const mouseX = Phaser.Math.Clamp(this.mousePosition.x, 0, screenWidth);
    // Map mouseX (0..screenWidth) to rotation 160..200°
    const newBaseRotationY = 160 + (mouseX / screenWidth) * 40;

    // Update baseRotationY for each button
    this.buttons.forEach(buttonObj => {
      if (buttonObj.card && buttonObj.card.angleY !== undefined && !buttonObj.isHovered) {
        buttonObj.card.angleY = newBaseRotationY;
      }
    });
  }
}
