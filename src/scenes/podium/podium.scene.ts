import { PodiumSceneCreator } from "./podium.creator";
import { PodiumSceneServices } from "./podium.services";
import { GameCore, GameEvents, type Player } from "../../core/game/game-core";

export interface PodiumSceneData {
  podiums: {
    name: string;
    price: number;
  }[];
  isBuzzed: boolean;
}

export class PodiumScene extends Phaser.Scene {
  public creator: PodiumSceneCreator;
  public services: PodiumSceneServices;
  
  constructor() {
    super("podium");
    this.creator = new PodiumSceneCreator(this);
    this.services = new PodiumSceneServices(this);
  }

  init() {
    console.log("PodiumScene init");
  }

  create(data: PodiumSceneData) {
    console.log("PodiumScene create");
    this.creator.setup(data);
    this.services.setup();
    this.scene.bringToTop();

    // Set up event listeners for game events
    this.setupEventListeners();

    this.services.startEnterAnimation().then(() => {
      console.log("Podium animation complete");
      
      // Update all podium scores to match current game state
      this.updateAllScores();
      if (data.isBuzzed) {
        this.startPlayerTimer(GameCore.players[0].name);
      }
    });
  }

  private setupEventListeners() {
    // Listen for score updates
    GameCore.eventEmitter.on(GameEvents.SCORE_UPDATED, (player: Player) => {
      this.updatePlayerScore(player);
    });

    // Listen for buzzing events
    GameCore.eventEmitter.on(GameEvents.PLAYER_BUZZED, (playerIndex: number) => {
      this.showBuzzIndicator(playerIndex);
    });

    // Listen for turn changes
    GameCore.eventEmitter.on(GameEvents.TURN_CHANGED, (player: Player) => {
      this.highlightCurrentPlayer(player);
    });

    // Listen for answer phase start
    GameCore.eventEmitter.on(GameEvents.ANSWER_TIME_START, (playerIndex: number) => {
      this.showAnsweringIndicator(playerIndex);
    });

    // Listen for answer phase end
    GameCore.eventEmitter.on(GameEvents.ANSWER_TIME_END, () => {
      this.clearAllIndicators();
    });
  }

  private updateAllScores() {
    // Update all players' scores to match GameCore state
    GameCore.players.forEach((player) => {
      this.updatePlayerScore(player);
    });
  }

  private updatePlayerScore(player: Player) {
    const podiumCard = this.services.getPodiumCardByName(player.name);
    if (podiumCard) {
      // Find and update the price text
      const priceElement = podiumCard.getElement('price-text');
      if (priceElement) {
        (priceElement as Phaser.GameObjects.Text).setText(`$${player.score}`);
      } else {
        // If price element doesn't exist, find it by searching children
        // This is a fallback for the existing podium structure
        this.updateScoreDisplay(podiumCard, player.score);
      }
      
      // Add score change animation
      this.animateScoreChange(podiumCard, player.score);
    }
  }

  private updateScoreDisplay(podiumCard: any, newScore: number) {
    // Find the text element that displays the score
    // This depends on the podium card structure
    const children = podiumCard.getAllChildren ? podiumCard.getAllChildren() : [];
    for (const child of children) {
      if (child instanceof Phaser.GameObjects.Text && child.text.includes('$')) {
        child.setText(`$${newScore}`);
        break;
      }
    }
  }

  private animateScoreChange(podiumCard: any, newScore: number) {
    // Create a brief scale animation to indicate score change
    this.tweens.add({
      targets: podiumCard,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // Add a temporary score change indicator
    const scoreChangeIndicator = this.add.text(
      podiumCard.x, 
      podiumCard.y - 50, 
      newScore > 0 ? `+$${newScore}` : `$${newScore}`,
      {
        fontSize: '24px',
        color: newScore > 0 ? '#00ff00' : '#ff0000',
        fontFamily: "'Swiss 911 Ultra Compressed BT'"
      }
    ).setOrigin(0.5);

    // Animate the indicator
    this.tweens.add({
      targets: scoreChangeIndicator,
      y: scoreChangeIndicator.y - 30,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      onComplete: () => {
        scoreChangeIndicator.destroy();
      }
    });
  }

  private showBuzzIndicator(playerIndex: number) {
    const player = GameCore.players[playerIndex];
    const podiumCard = this.services.getPodiumCardByName(player.name);
    
    if (podiumCard) {
      // Create buzz indicator
      const buzzIndicator = this.add.circle(
        podiumCard.x, 
        podiumCard.y - 30, 
        20, 
        0x00ff00
      ).setAlpha(0).setName(`buzz-indicator-${player.name}`);
      
      // Animate buzz indicator
      this.tweens.add({
        targets: buzzIndicator,
        alpha: 1,
        scale: { from: 0, to: 1.5 },
        duration: 300,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          buzzIndicator.destroy();
        }
      });

      // Add buzz text
      const buzzText = this.add.text(
        podiumCard.x,
        podiumCard.y + 50,
        "BUZZED!",
        {
          fontSize: '20px',
          color: '#00ff00',
          fontFamily: "'Swiss 911 Ultra Compressed BT'"
        }
      ).setOrigin(0.5).setName(`buzz-text-${player.name}`);

      // Remove buzz text after delay
      this.time.delayedCall(2000, () => {
        buzzText.destroy();
      });
    }
  }

  private showAnsweringIndicator(playerIndex: number) {
    const player = GameCore.players[playerIndex];
    const podiumCard = this.services.getPodiumCardByName(player.name);
    
    if (podiumCard) {
      // Clear any existing indicators
      this.clearPlayerIndicators(player.name);
      
      // Create answering indicator
      const answerIndicator = this.add.text(
        podiumCard.x,
        podiumCard.y + 50,
        "ANSWERING...",
        {
          fontSize: '18px',
          color: '#ffff00',
          fontFamily: "'Swiss 911 Ultra Compressed BT'"
        }
      ).setOrigin(0.5).setName(`answer-indicator-${player.name}`);

      // Pulse animation
      this.tweens.add({
        targets: answerIndicator,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private highlightCurrentPlayer(player: Player) {
    // Clear existing highlights
    this.clearAllHighlights();
    
    const podiumCard = this.services.getPodiumCardByName(player.name);
    if (podiumCard) {
      // Add highlight border or glow effect
      const highlight = this.add.rectangle(
        podiumCard.x,
        podiumCard.y,
        podiumCard.displayWidth + 10,
        podiumCard.displayHeight + 10,
        0x00ff00,
        0.3
      ).setName(`highlight-${player.name}`);
      
      // Send highlight to back so it appears behind the podium
      this.children.sendToBack(highlight);
    }
  }

  private clearPlayerIndicators(playerName: string) {
    // Remove all indicators for a specific player
    const indicators = [
      `buzz-indicator-${playerName}`,
      `buzz-text-${playerName}`,
      `answer-indicator-${playerName}`
    ];
    
    indicators.forEach(name => {
      const indicator = this.children.getByName(name);
      if (indicator) {
        indicator.destroy();
      }
    });
  }

  private clearAllIndicators() {
    // Remove all player indicators
    GameCore.players.forEach(player => {
      this.clearPlayerIndicators(player.name);
    });
  }

  private clearAllHighlights() {
    // Remove all player highlights
    GameCore.players.forEach(player => {
      const highlight = this.children.getByName(`highlight-${player.name}`);
      if (highlight) {
        highlight.destroy();
      }
    });
  }

  // Start timer animation for a specific player (used during answer phase)
  public startPlayerTimer(playerName: string) {
    const podiumCard = this.services.getPodiumCardByName(playerName);
    if (podiumCard) {
      this.services.startPodiumTimerUnitAnimation(podiumCard);
    }
  }

  destroy() {
    // Clean up event listeners
    GameCore.eventEmitter.removeAllListeners(GameEvents.SCORE_UPDATED);
    GameCore.eventEmitter.removeAllListeners(GameEvents.PLAYER_BUZZED);
    GameCore.eventEmitter.removeAllListeners(GameEvents.TURN_CHANGED);
    GameCore.eventEmitter.removeAllListeners(GameEvents.ANSWER_TIME_START);
    GameCore.eventEmitter.removeAllListeners(GameEvents.ANSWER_TIME_END);
  }
}
