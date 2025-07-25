import type OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { convert2DTo3D, update3DGameObject } from "../../utils/3d";
import { FPSIndicator } from "../../utils/fps";

export class MainMenuScene extends Phaser.Scene {
  // private cameraTween?: Phaser.Tweens.Tween;
  private buttons: any[] = [];
  private mousePosition = { x: 0, y: 0 };
  private loading: boolean = true;
  private tabButtonIndex: number = -1;
  private tabButtons: OverlapSizer[] = [];
  private fpsIndicator?: FPSIndicator;

  constructor() {
    super("main-menu");
  }

  async create() {
    const { width, height } = this.scale;
    
    // Initialize mouse position to center of screen to start cards straight at 180°
    this.mousePosition.x = width / 2;
    this.mousePosition.y = height / 2;
    
    // Add FPS indicator
    this.fpsIndicator = new FPSIndicator(this);
    
    this.scene.launch("hud");
    this.scene.bringToTop("hud");

    // Background with parallax scroll effect
    // const backgroundImage = this.add.image(width / 2, height / 2, "scenes.main-menu.background")
    const backgroundImage = this.add.video(width / 2, height / 2, "scenes.main-menu.background-video")
    .setName("background-image");
    backgroundImage.play(true);
    backgroundImage.setScale(1.3, 1);
    // backgroundImage.setDisplaySize(width * 2, height * 1.8); // Make it wider for scrolling
    backgroundImage.setDepth(-1);


    // Add background to tracking
    // Title Background
    const titleBackground = this.createTitleBackground();
    titleBackground.setAlpha(0);

    const sizer = this.rexUI.add.sizer({
      orientation: "vertical",
      x: width / 2,
      y: titleBackground.y - titleBackground.displayHeight / 2,
      originY: 0,
    });

    // Title - Create perspective logo
    sizer.add(this.add.image(0, 0, "scenes.main-menu.logo-header"), { padding: { bottom: 60,top: 30 } });
    const title = this.createPerspectiveLogo();

    sizer.add(title, { padding: { bottom: 40 } });
    sizer.add(this.add.image(0, 0, "scenes.main-menu.divider-h"));
    sizer.add(this.createButtonStack());
    sizer.add(this.add.image(0, 0, "scenes.main-menu.divider-h"));
    sizer.add(this.createButtons(), { padding: { top: 20 } });
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
    
    // [TEMP] We don't have a start button for now, so let's just wait 5 seconds and start the game.
    this.time.delayedCall(1500, () => {
      this.loading = false;
      this.setupMouseTracking();
    });

    this.input.keyboard?.on("keydown-TAB", (event: KeyboardEvent) => {
      event.preventDefault();
      this.tabButtonIndex = (this.tabButtonIndex + 1) % this.tabButtons.length;
      const tabButton = this.tabButtons[this.tabButtonIndex];
      const otherTabButtons = this.tabButtons.filter((tab) => tab !== tabButton);
      tabButton.emit("focus", true);
      otherTabButtons.forEach((tab) => tab.emit("focus", false));
    });
  }

  private createTitleBackground() {
    const backgroundTexture = this.textures.get("scenes.main-menu.title-background");
    const backgroundWidth = backgroundTexture.source[0].width;
    const backgroundHeight = backgroundTexture.source[0].height;

    const perspectiveTitleBackground = this.add.rexPerspectiveCard({
      x: this.scale.width / 2,
      y: this.scale.height / 2,
      width: backgroundWidth,
      height: backgroundHeight,
      front: {
        key: "scenes.main-menu.title-background"
      },
      back: {
        key: "scenes.main-menu.title-background"
      }
    }).setName("title-background");

    // perspectiveTitleBackground.rotateY = Phaser.Math.DegToRad(180);

    // const titleBackgroundObj = {
    //   card: perspectiveTitleBackground,
    //   width: backgroundWidth,
    //   height: backgroundHeight,
    //   isHovered: false,
    //   targetRotationX: 0,
    //   targetRotationY: 0,
    //   currentRotationX: 0,
    //   currentRotationY: 0,
    //   baseAngleY: 180,
    //   x: 0, // Will be set when positioned
    // };

    // this.buttons.push(titleBackgroundObj);

    return perspectiveTitleBackground;
  }

  private createButtonStack() {
    const buttonStack = this.add.image(0, 0, "scenes.main-menu.button-stack");

    const sizer = this.rexUI.add.sizer({
      width: buttonStack.displayWidth,
      height: buttonStack.displayHeight,
      space: { item: 30 },
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
        this.scene.start("new-game-board")
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

  private createButton(text: string, _index: number, callback?: () => void) {
    // Create a temporary text object to generate textures
    const tempText = this.add.text(0, 0, text, {
        fontSize: '40px',
        fontFamily: "'AtkinsonHyperlegibleNext-Regular'",
        color: '#ffffff',
    }).setPadding(5);

    // Generate normal texture
    if (!this.textures.exists(text)) {
        const rt = this.make.renderTexture({ width: tempText.width, height: tempText.height }, false);
        rt.draw(tempText, 0, 0);
        rt.saveTexture(text);
    }

    // Generate hover texture (black text)
    if (!this.textures.exists(`${text}-hover`)) {
        tempText.setColor('#000000');
        const rt = this.make.renderTexture({ width: tempText.width, height: tempText.height }, false);
        rt.draw(tempText, 0, 0);
        rt.saveTexture(`${text}-hover`);
    }

    tempText.destroy();

    // Get button dimensions from texture
    const buttonTexture = this.textures.get("scenes.main-menu.button-enabled");
    const buttonWidth = buttonTexture.source[0].width;
    const buttonHeight = buttonTexture.source[0].height;

    // Create perspective card wrapper using button texture
    const perspectiveCard = this.add.rexPerspectiveCard({
      x: 0,
      y: 0,
      width: buttonWidth,
      height: buttonHeight,
      front: {
        key: "scenes.main-menu.button-enabled"
      },
      back: {
        key: "scenes.main-menu.button-enabled"
      }
    });

    const textTexture = this.textures.get(text);
    const perspectiveText = this.add.rexPerspectiveCard({
      x: 0,
      y: 0,
      width: textTexture.source[0].width,
      height: textTexture.source[0].height,
      front: {
        key: text
      },
      back: {
        key: text
      }
    });

    // Set initial rotation to show back face (Y = 180 degrees)
    perspectiveCard.rotateY = Phaser.Math.DegToRad(180);
    perspectiveText.rotateY = Phaser.Math.DegToRad(180);

    // Make perspective card interactive instead of button
    perspectiveCard.setInteractive({ useHandCursor: true });

    // Store button data for tracking
    const buttonObj = {
      card: perspectiveCard,
      text: perspectiveText,
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
      this.tabButtons.forEach((tab) => tab.emit("focus", false));
      // Just change text color and add scale effect for hover feedback
      perspectiveCard.backFace.setTexture("scenes.main-menu.button-hover");
      perspectiveText.backFace.setTexture(`${text}-hover`);
      this.tweens.add({
        targets: [perspectiveCard, perspectiveText],
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 200,
        ease: 'Power2'
      });
    });

    perspectiveCard.on(Phaser.Input.Events.POINTER_OUT, () => {
      buttonObj.isHovered = false;
      // Reset text color and scale
      perspectiveCard.backFace.setTexture("scenes.main-menu.button-enabled");
      perspectiveText.backFace.setTexture(text);
      this.tweens.add({
        targets: [perspectiveCard, perspectiveText],
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
      
      // Reset rotation when not hovering
      buttonObj.targetRotationX = 0;
      buttonObj.targetRotationY = 0;
    });

    perspectiveCard.on(Phaser.Input.Events.POINTER_DOWN, async () => {
      perspectiveCard.backFace.setTexture("scenes.main-menu.button-pressed");
      // Add highlight animation for clicked button
      await new Promise((resolve) =>
        this.tweens.add({
          targets: [perspectiveCard, perspectiveText],
          duration: 200,
          ease: "Power2",
          yoyo: true,
          onComplete: resolve,
          props: {
            scale: 0.85,
          },
        })
      );

      // Reset clicked button
      this.time.delayedCall(400, () => {
        this.tweens.add({
          targets: [perspectiveCard, perspectiveText],
          duration: 200,
          ease: "Power2",
          onComplete: () => {
            perspectiveCard.setDepth(0);
            perspectiveText.setDepth(1);
            if (callback) callback();
          },
          props: {
            scale: 1,
          },
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

    sizer.add(perspectiveText, {
      align: "center",
      expand: false,
    });

    // Store reference to update position later for mouse tracking
    sizer.on('sizer.postlayout', () => {
      buttonObj.x = sizer.x;
      buttonObj.y = sizer.y;
    });

    this.tabButtons.push(sizer);
    sizer.on("focus", (value: boolean) => {
      if (value) {
        perspectiveCard.backFace.setTexture("scenes.main-menu.button-focus");
      } else {
        perspectiveCard.backFace.setTexture("scenes.main-menu.button-enabled");
      }
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
    // const button = this.add.image(0, 0, key).setAlpha(0.9);
    const perspectiveImage = this.add.rexPerspectiveCard({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      front: {
        key: key
      },
      back: {
        key: key
      }
    });

    perspectiveImage.rotateY = Phaser.Math.DegToRad(180);

    const buttonObj = {
      card: perspectiveImage,
      width: 100,
      height: 100,
      isHovered: false,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
      baseAngleY: 180,
      x: 0, // Will be set when positioned
      y: 0, // Will be set when positioned
    }

    // this.buttons.push(buttonObj);

    perspectiveImage.setInteractive({ useHandCursor: true });
    perspectiveImage.on(Phaser.Input.Events.POINTER_OVER, () => {
      buttonObj.isHovered = true;
      perspectiveImage.angleY = 180;
    });
    perspectiveImage.on(Phaser.Input.Events.POINTER_OUT, () => {
      buttonObj.isHovered = false;
    });
    sizer.add(perspectiveImage);

    return sizer;
  }



  private setupMouseTracking() {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePosition.x = pointer.x;
      this.mousePosition.y = pointer.y;
    });
  }

  update() {
    // Update FPS indicator
    if (this.fpsIndicator) {
      this.fpsIndicator.update();
    }
    
    // Update background position based on mouse position
    const backgroundImage = this.children.getByName("background-image") as Phaser.GameObjects.Image;
    if (backgroundImage && !this.loading) {
      const screenWidth = Number(this.scale.width) || Number(this.game.config.width) || 1920;
      const mouseX = Phaser.Math.Clamp(this.mousePosition.x, 0, screenWidth);
      
      // Calculate the scroll offset based on mouse position
      // mouseX ranges from 0 to screenWidth, we want to move the background by a maximum of width/2 in either direction
      const scrollRange = screenWidth / 8; // Reduced from /4 to /8 for more subtle movement
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
    const screenHeight = Number(this.scale.height) || Number(this.game.config.height) || 1080;
    const mouseX = Phaser.Math.Clamp(this.mousePosition.x, 0, screenWidth);
    const mouseY = Phaser.Math.Clamp(this.mousePosition.y, 0, screenHeight);
    // Map mouseX (0..screenWidth) to rotation 170..190°
    const newBaseRotationX = (-10 + (mouseY / screenHeight) * 20) * -1;
    const newBaseRotationY = 170 + (mouseX / screenWidth) * 20;

    // Update baseRotationY for each button
    const titleBackground = this.children.getByName("title-background") as Phaser.GameObjects.Image;
    // console.log(mouseX)
    this.buttons.forEach(buttonObj => {
      // AngleY
      if (buttonObj.card && buttonObj.card.angleY !== undefined && !buttonObj.isHovered) {
        // Apply reduced effect for background
        if (buttonObj.isBackground) {
          // Very subtle rotation for background (only 10% of normal range)
          const reducedRotation = 179 + ((newBaseRotationY - 175) * 0.1);
          buttonObj.card.angleY = reducedRotation;
        } else if (buttonObj.isButtonStack) {
          const reducedRotation = 178 + ((newBaseRotationY - 160) * 0.1);
          buttonObj.card.angleY = reducedRotation;
        }else {
          buttonObj.card.angleY = newBaseRotationY;
        }
      }
      if (buttonObj.text && buttonObj.text.angleY !== undefined && !buttonObj.isHovered) {
        buttonObj.text.angleY = newBaseRotationY;
      }

      // AngleX
      if (buttonObj.card && buttonObj.card.angleX !== undefined && !buttonObj.isHovered) {
        buttonObj.card.angleX = newBaseRotationX;
      }
      if (buttonObj.text && buttonObj.text.angleX !== undefined && !buttonObj.isHovered) {
        buttonObj.text.angleX = newBaseRotationX;
      }
      
      if (buttonObj.card === titleBackground) return;
      this.update3DCardPosition(buttonObj.card);
      if (buttonObj.text) this.update3DCardPosition(buttonObj.text);
    });
  }
  private update3DCardPosition(gameObject: any) {
    const screenWidth = Number(this.scale.width) || Number(this.game.config.width) || 1920;
    const screenHeight = Number(this.scale.height) || Number(this.game.config.height) || 1080;
    const factorX = (((gameObject.angleX * -1) + 10) / 20) * 2 - 1;
    const factorY = ((gameObject.angleY - 170) / 20) * 2 - 1;
    let initialPosition = gameObject.getData("initial-position");
    if (!initialPosition) {
      initialPosition = convert2DTo3D({ x: gameObject.x, y: gameObject.y}, screenWidth, screenHeight);
      gameObject.setData("initial-position", initialPosition);
    }
    update3DGameObject(gameObject, { x: initialPosition.x, y: initialPosition.y, z: 0 }, { x: -0.225 * factorY, y: (0.225 / 2) * factorX, z: -1 });
  }
}
