import { GameBoardSceneServices } from "./new-game-board.services";
import { GameBoardSceneCreator } from "./new-game-board.creator";
// import { GameCore } from "../../core/game/game-core";
import type { Question } from "../../core/game/models/questions.model";
// import { InputComponent } from "../../components/input";
import type { HudScene } from "../hud/hud.scene";
import { GameStateManager } from "../../core/game/game-state-manager";
import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";

export class NewGameBoardScene extends Phaser.Scene {
  public creator: GameBoardSceneCreator;
  public services: GameBoardSceneServices;
  private stateManager?: GameStateManager;

  constructor() {
    super("new-game-board");
    this.creator = new GameBoardSceneCreator(this);
    this.services = new GameBoardSceneServices(this);
  }

  init() {
    console.log("GameBoardScene init");
  }

  create() {
    console.log("GameBoardScene create");
    this.creator.setup();
    this.services.setup();

    // Initialize the state manager
    this.stateManager = GameStateManager.getInstance(this.game.events);

    const mainContainer = this.children.getByName("main-container") as Sizer;
    mainContainer.setAlpha(0);
    this.tweens.add({
      targets: mainContainer,
      alpha: 1,
      duration: 1000,
      ease: "power2.inOut",
    });

    // Wait for HUD to be ready, then register components with state manager
    this.time.delayedCall(1000, () => {
      /** HUD Scene */
      this.scene.launch("hud");
      this.scene.bringToTop("hud");
      
      // Get HUD scene and register all components with state manager
      const hudScene = this.scene.get("hud") as HudScene;
      if (hudScene && hudScene.services) {
        if (this.stateManager) {
          console.log('Registering components with state manager');
          this.stateManager.registerComponents(
            this.creator.listeningComponent,
            hudScene.services,
            this.services
          );
          
          // Transition to hub state to show the HUD
          this.time.delayedCall(500, () => {
            console.log('Initial transition to hub state');
            this.stateManager!.transitionTo('hub');
          });
        }
      } else {
        console.error('HUD scene or services not available', { hudScene: !!hudScene, services: hudScene?.services });
      }
    });

    // Disable all game board interactions initially
    this.services.disableAllInteraction();

    // Listen for state changes to handle any additional logic
    this.game.events.on('state-changed', (transition: { from: string, to: string }) => {
      console.log(`Game state changed: ${transition.from} -> ${transition.to}`);
      
      // Handle any scene-specific logic based on state changes
      switch (transition.to) {
        case 'full':
          // Re-enable game interactions when in full view
          this.services.enableAllInteraction();
          break;
        case 'hub':
          // Partial interactions in hub view
          this.services.disableAllInteraction();
          break;
        case 'listening':
        case 'listening-hub':
          // No interactions during listening
          this.services.disableAllInteraction();
          break;
      }
    });

    // Handle question selection events
    this.events.on("question-selected", (question: Question) => {
      console.log("Question selected:", question);
      this.services.disableAllInteraction();
      this.time.delayedCall(1_000, () => {
        this.scene.start("reply-question", { question });
      });
    });

    /** Destroy event listener */
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroy();
    });
  }

  destroy() {
    // Clean up state manager
    if (this.stateManager) {
      this.stateManager.destroy();
    }
    
    // Remove any remaining event listeners
    this.game.events.off('state-changed');
  }
}