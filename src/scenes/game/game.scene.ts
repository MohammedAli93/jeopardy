import { GameCore, GameEvents } from "../../core/game/game-core";

interface GameData {
  gameMode: "single-player" | "multi-player";
  podiums: { name: string, price: number }[];
}

export class GameScene extends Phaser.Scene {
  gameData: GameData;
  constructor() {
    super("game");
    this.gameData = {
      gameMode: "single-player",
      podiums: []
    };
  }

  init() {
    console.log("GameScene init");
  }

  create(data: GameData) {
    this.gameData = data;
    console.log("GameScene create");
    const { width, height } = this.scale;
    // For some reason I can't get the correct video size, so I'm hardcoding it.
    const VIDEO_WIDTH = 854;
    const VIDEO_HEIGHT = 480;

    // Background
    const video = this.add.video(width / 2, height / 2, "scenes.game.intro");
    video.setScale(Math.max(width / VIDEO_WIDTH, height / VIDEO_HEIGHT));
    video.play();

    video.once(Phaser.GameObjects.Events.VIDEO_COMPLETE, async () => {
      const background = this.add
        .image(width / 2, height / 2, "scenes.game.background")
        .setAlpha(0);

      await Promise.all([
        new Promise((resolve) =>
          this.tweens.add({
            targets: video,
            props: {
              alpha: { from: 1, to: 0 },
            },
            duration: 250,
            onComplete: resolve,
          })
        ),
        new Promise((resolve) =>
          this.tweens.add({
            targets: background,
            props: {
              alpha: { from: 0, to: 1 },
            },
            duration: 250,
            onComplete: resolve,
          })
        ),
      ]);

      // Initialize game for single-player mode
      this.initializeGame(data.gameMode);

      // Show instructions
      this.add
        .text(width / 2, height / 2, "Get ready to play Jeopardy!\nPress [SPACE] to start", {
          fontSize: '48px',
          color: '#ffffff',
          fontFamily: "'Swiss 911 Ultra Compressed BT'",
          align: 'center'
        })
        .setOrigin(0.5);

      // Wait for player to start
      this.input.keyboard?.once('keydown-SPACE', () => {
        this.startGame();
      });
    });
    
    // Test purpose 
    // this.initializeGame(data.gameMode);

    // // Show instructions
    // this.add
    //   .text(width / 2, height / 2, "Get ready to play Jeopardy!\nPress [SPACE] to start", {
    //     fontSize: '48px',
    //     color: '#ffffff',
    //     fontFamily: "'Swiss 911 Ultra Compressed BT'",
    //     align: 'center'
    //   })
    //   .setOrigin(0.5);

    // // Wait for player to start
    // this.input.keyboard?.once('keydown-SPACE', () => {
    //   this.startGame();
    // });

  }

  private initializeGame(gameMode: "single-player" | "multi-player") {
    // Set game mode
    GameCore.gameMode = gameMode;
    
    // Reset and initialize game state
    GameCore.resetGame();
    
    // Emit game start event
    GameCore.eventEmitter.emit(GameEvents.GAME_START);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for round completion
    GameCore.eventEmitter.on(GameEvents.ROUND_COMPLETE, () => {
      this.handleRoundComplete();
    });

    // Listen for game over
    GameCore.eventEmitter.on(GameEvents.GAME_OVER, () => {
      this.handleGameOver();
    });
  }

  private startGame() {
    // Launch podium scene with all players
    this.scene.launch("podium", {
      podiums: GameCore.players.map(player => ({
        name: player.name,
        price: player.score
      }))
    });

    // Start the first round
    this.scene.start("choose-question");
  }

  private handleRoundComplete() {
    GameCore.advanceToNextRound();
    
    if (GameCore.gameState.round === "final-jeopardy") {
      console.log("Starting Final Jeopardy!");
      this.startFinalJeopardy();
    } else {
      // Continue to next round
      this.scene.start("choose-question");
    }
  }

  private startFinalJeopardy() {
    const finalQuestion = GameCore.getRandomFinalJeopardyQuestion();
    
    if (!finalQuestion) {
      console.warn("No Final Jeopardy questions available!");
      this.handleGameOver();
      return;
    }

    // Check if any players are eligible (score > 0)
    const eligiblePlayers = GameCore.players.filter(player => player.score > 0);
    
    if (eligiblePlayers.length === 0) {
      console.log("No players eligible for Final Jeopardy!");
      this.handleGameOver();
      return;
    }

    // Launch Final Jeopardy scene
    this.scene.start("final-jeopardy", { question: finalQuestion });
  }

  private handleGameOver() {
    // Find winner
    const winner = GameCore.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    // Show game over screen
    const { width, height } = this.scale;
    
    // Clear screen
    this.children.removeAll();
    
    // Add background
    this.add.image(width / 2, height / 2, "scenes.game.background");
    
    // Show winner
    this.add.text(width / 2, height / 2 - 100, 
      `Game Over!\n${winner.name} wins with $${winner.score}!`, {
        fontSize: '80px',
        color: '#ffffff',
        fontFamily: "'Swiss 911 Ultra Compressed BT'",
        align: 'center'
      }
    ).setOrigin(0.5);

    // Show final scores
    let scoreText = "Final Scores:\n";
    GameCore.players
      .sort((a, b) => b.score - a.score)
      .forEach((player, index) => {
        scoreText += `${index + 1}. ${player.name}: $${player.score}\n`;
      });

    this.add.text(width / 2, height / 2 + 100, scoreText, {
      fontSize: '40px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Return to main menu after delay
    this.time.delayedCall(5000, () => {
      this.scene.start("main-menu");
    });
  }

  destroy() {
    // Clean up event listeners
    GameCore.eventEmitter.removeAllListeners();
  }
}
