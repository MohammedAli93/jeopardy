import type { ListeningComponent } from "../../components/listening";
import type { HudService } from "../../scenes/hud/hud.service";
import type { GameBoardSceneServices } from "../../scenes/new-game-board/new-game-board.services";

export type GameState = 'full' | 'hub' | 'listening' | 'listening-hub';

export interface GameStateTransition {
  from: GameState;
  to: GameState;
  duration?: number;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private currentState: GameState = 'full';
  private gameEvents: Phaser.Events.EventEmitter;
  
  // Component references
  private listeningComponent?: ListeningComponent;
  private hudService?: HudService;
  private gameBoardServices?: GameBoardSceneServices;

  constructor(gameEvents: Phaser.Events.EventEmitter) {
    this.gameEvents = gameEvents;
    this.setupEventListeners();
  }

  public static getInstance(gameEvents: Phaser.Events.EventEmitter): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager(gameEvents);
    }
    return GameStateManager.instance;
  }

  public registerComponents(
    listeningComponent: ListeningComponent,
    hudService: HudService,
    gameBoardServices: GameBoardSceneServices
  ) {
    this.listeningComponent = listeningComponent;
    this.hudService = hudService;
    this.gameBoardServices = gameBoardServices;
  }

  private setupEventListeners() {
    // Listen to HUD events
    this.gameEvents.on('mic-enable', () => {
      console.log('mic-enable event received, current state:', this.currentState);
      this.transitionTo('listening');
    });
    this.gameEvents.on('mic-disable', () => {
      console.log('mic-disable event received, current state:', this.currentState);
      this.transitionTo('hub');
    });
    this.gameEvents.on('back-button-clicked', () => {
      console.log('back-button-clicked event received, current state:', this.currentState);
      this.transitionTo('full');
    });
    this.gameEvents.on('hub-show', () => {
      console.log('hub-show event received, current state:', this.currentState);
      this.transitionTo('hub');
    });
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }

  public async transitionTo(newState: GameState, duration: number = 1000): Promise<void> {
    if (this.currentState === newState) {
      console.log(`Already in state: ${newState}`);
      return;
    }

    const transition: GameStateTransition = {
      from: this.currentState,
      to: newState,
      duration
    };

    console.log(`State transition: ${transition.from} -> ${transition.to}`);

    // Execute the transition
    await this.executeTransition(transition);
    
    // Update current state
    this.currentState = newState;
    
    // Emit state change event
    this.gameEvents.emit('state-changed', { from: transition.from, to: newState });
  }

  private async executeTransition(transition: GameStateTransition): Promise<void> {
    const { from, to, duration } = transition;

    // Create animation promises array
    const animations: Promise<void>[] = [];

    // Handle game board animations
    if (this.gameBoardServices) {
      switch (to) {
        case 'full':
          animations.push(this.gameBoardServices.animateToFull(duration, from as 'full' | 'hub' | 'listening'));
          break;
        case 'hub':
          animations.push(this.gameBoardServices.animateToHub(duration, from as 'full' | 'hub' | 'listening'));
          break;
        case 'listening':
          animations.push(this.gameBoardServices.animateToListening(duration, from as 'full' | 'hub' | 'listening'));
          break;
        case 'listening-hub':
          animations.push(this.gameBoardServices.animateToListeningHub(duration, from as 'full' | 'hub' | 'listening'));
          // Also adjust listening component position for listening-hub state
          if (this.listeningComponent && this.listeningComponent.getIsVisible()) {
            this.listeningComponent.adjustPosition(24);
          }
          break;
      }
    }

    // Handle HUD visibility
    if (this.hudService) {
      if (to === 'hub') {
        // Show HUD only for hub state
        if (!this.hudService.isShown) {
          animations.push(this.hudService.showHud());
        }
      } else if (to === 'full' || to === 'listening' || to === 'listening-hub') {
        // Hide HUD for full, listening, and listening-hub states
        if (this.hudService.isShown) {
          animations.push(this.hudService.hideHud());
        }
      }
    }

    // Handle listening component visibility
    if (this.listeningComponent) {
      if (to === 'listening' || to === 'listening-hub') {
        // Show listening component
        animations.push(this.listeningComponent.show());
        
        // If transitioning to listening, set up automatic transition to listening-hub
        // This will be triggered after all animations complete
        if (to === 'listening') {
          // No delay - will be triggered after animations complete
        }
      } else {
        // Hide listening component for other states
        animations.push(this.listeningComponent.hide());
        
        // Reset mic state when leaving listening modes
        if (this.hudService && (from === 'listening' || from === 'listening-hub')) {
          this.hudService.resetMicState();
        }
      }
    }

    // Wait for all animations to complete
    await Promise.all(animations);
    
    // Auto-transition from listening to listening-hub after animations complete
    if (to === 'listening') {
      // Immediate transition to listening-hub for better responsiveness
      console.log('Auto-transitioning from listening to listening-hub');
      this.transitionTo('listening-hub', 1000);
    }
  }

  public destroy() {
    this.gameEvents.off('mic-enable');
    this.gameEvents.off('mic-disable');
    this.gameEvents.off('back-button-clicked');
    this.gameEvents.off('hub-show');
    
    if (this.listeningComponent) {
      this.listeningComponent.destroy();
    }
  }
} 