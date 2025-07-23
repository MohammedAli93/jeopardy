import { GameCore, GameEvents } from "../../core/game/game-core";
import type { Question } from "../../core/game/models/questions.model";

interface FinalJeopardyData {
  question: Question;
}

interface PlayerWager {
  playerIndex: number;
  wager: number;
  answer: string;
  isAnswered: boolean;
}

export class FinalJeopardyScene extends Phaser.Scene {
  private questionData?: FinalJeopardyData;
  private eligiblePlayers: number[] = [];
  private playerWagers: PlayerWager[] = [];
  // Track current phase for managing game flow
  // @ts-ignore - Used in multiple methods below
  private currentPhase: "announcement" | "wagering" | "question" | "answering" | "results" = "announcement";
  private wagerTimeLeft: number = 10;
  private answerTimeLeft: number = 10;
  private phaseTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("final-jeopardy");
  }



  private cleanupDOMElements() {
    // Remove any remaining input elements by ID
    const inputIds = ['final-jeopardy-answer-input'];
    inputIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
  }

  create(data: FinalJeopardyData) {
    this.questionData = data;
    
    // Determine eligible players (score > 0) - players with negative scores cannot participate
    this.eligiblePlayers = GameCore.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => player.score > 0)
      .map(({ index }) => index);

    // If no eligible players, skip to game over
    if (this.eligiblePlayers.length === 0) {
      this.handleGameOver();
      return;
    }

    // Initialize player wagers
    this.playerWagers = this.eligiblePlayers.map(playerIndex => ({
      playerIndex,
      wager: 0,
      answer: "",
      isAnswered: false
    }));

    this.startAnnouncementPhase();
  }

  private startAnnouncementPhase() {
    this.currentPhase = "announcement";
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    // Final Jeopardy announcement
    const titleText = this.add.text(width / 2, height / 4, "FINAL JEOPARDY!", {
      fontSize: '84px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Animate title
    titleText.setScale(0);
    this.tweens.add({
      targets: titleText,
      scale: 1,
      duration: 1500,
      ease: 'Bounce.easeOut'
    });

    // Show category
    this.time.delayedCall(2000, () => {
      // Remove "FINAL JEOPARDY: " prefix from category for display
      const displayCategory = this.questionData!.question.category.replace(/^FINAL JEOPARDY:\s*/, '');
      this.add.text(width / 2, height / 2, `Category: ${displayCategory}`, {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: "'Swiss 911 Ultra Compressed BT'",
        align: 'center'
      }).setOrigin(0.5);

      // Show eligible players
      this.time.delayedCall(1500, () => {
        let playerText = "Eligible players:\n";
        this.eligiblePlayers.forEach(playerIndex => {
          const player = GameCore.players[playerIndex];
          playerText += `${player.name} ($${player.score})\n`;
        });

        this.add.text(width / 2, height / 2 + 100, playerText, {
          fontSize: '32px',
          color: '#ffffff',
          fontFamily: "'Swiss 911 Ultra Compressed BT'",
          align: 'center'
        }).setOrigin(0.5);

        // Proceed to wagering after delay
        this.time.delayedCall(3000, () => {
          this.startWageringPhase();
        });
      });
    });
  }

  private startWageringPhase() {
    this.currentPhase = "wagering";
    this.wagerTimeLeft = 10;
    
    // Clear screen
    this.children.removeAll();
    
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    // Wagering instructions
    this.add.text(width / 2, 100, "WAGERING PHASE", {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, 150, "Each player must wager up to their current score", {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Timer display
    const timerText = this.add.text(width / 2, 200, `Time remaining: ${this.wagerTimeLeft}s`, {
      fontSize: '32px',
      color: '#ff0000',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Start wagering timer
    this.phaseTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.wagerTimeLeft--;
        timerText.setText(`Time remaining: ${this.wagerTimeLeft}s`);
        
        if (this.wagerTimeLeft <= 0) {
          this.finishWageringPhase();
        }
      },
      callbackScope: this,
      repeat: 29
    });

    // Handle wagering for each player
    this.handlePlayerWagering();
  }

  private handlePlayerWagering() {
    let wageringIndex = 0;

    const processNextWager = () => {
      if (wageringIndex >= this.eligiblePlayers.length) {
        return; // All wagers processed
      }

      const playerIndex = this.eligiblePlayers[wageringIndex];
      const player = GameCore.players[playerIndex];

      if (player.isHuman) {
        this.showHumanWagerInput(playerIndex, () => {
          wageringIndex++;
          processNextWager();
        });
      } else {
        this.processAIWager(playerIndex);
        wageringIndex++;
        this.time.delayedCall(1500, processNextWager);
      }
    };

    processNextWager();
  }

  private showHumanWagerInput(playerIndex: number, onComplete: () => void) {
    const { width } = this.scale;
    const player = GameCore.players[playerIndex];
    const maxWager = player.score;

    // Create wager input
    const promptText = this.add.text(width / 2, 300, `${player.name}, enter your wager (max $${maxWager}):`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    const inputElement = this.add.dom(width / 2, 350).createFromHTML(`
      <input type="number" 
             min="0" 
             max="${maxWager}" 
             placeholder="Enter wager" 
             style="padding: 10px; font-size: 20px; width: 200px; text-align: center; border: 2px solid #0066cc; border-radius: 5px;">
    `);

    const input = inputElement.node as HTMLInputElement;
    input.focus();

    const submitButton = this.add.text(width / 2, 400, "SUBMIT", {
      fontSize: '24px',
      color: '#000000',
      backgroundColor: '#ffff00',
      padding: { x: 15, y: 8 },
      fontFamily: "'Swiss 911 Ultra Compressed BT'"
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      const wager = Math.max(0, Math.min(parseInt(input.value) || 0, maxWager));
      this.setPlayerWager(playerIndex, wager);
      
      // Clean up UI
      promptText.destroy();
      inputElement.destroy();
      submitButton.destroy();
      
      onComplete();
    });

    // Handle Enter key
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitButton.emit('pointerdown');
      }
    });
  }

  private processAIWager(playerIndex: number) {
    const player = GameCore.players[playerIndex];
    const maxWager = player.score;
    const aiWager = GameCore.simulateAIWager(player, maxWager);
    
    this.setPlayerWager(playerIndex, aiWager);
    
    // Show AI wager briefly
    const { width } = this.scale;
    const wagerText = this.add.text(width / 2, 300, `${player.name} wagers $${aiWager}`, {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      wagerText.destroy();
    });
  }

  private setPlayerWager(playerIndex: number, wager: number) {
    const playerWager = this.playerWagers.find(pw => pw.playerIndex === playerIndex);
    if (playerWager) {
      playerWager.wager = wager;
    }
  }

  private finishWageringPhase() {
    if (this.phaseTimer) {
      this.phaseTimer.remove();
    }

    // Set default wagers for any unset wagers
    this.playerWagers.forEach(playerWager => {
      if (playerWager.wager === 0 && !this.playerWagers.some(pw => pw.playerIndex === playerWager.playerIndex && pw.wager > 0)) {
        const player = GameCore.players[playerWager.playerIndex];
        playerWager.wager = Math.floor(player.score * 0.5); // Default to half score
      }
    });

    this.startQuestionPhase();
  }

  private startQuestionPhase() {
    this.currentPhase = "question";
    
    // Clear screen
    this.children.removeAll();
    
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    // Show question
    this.add.text(width / 2, height / 2 - 100, "Final Jeopardy Question:", {
      fontSize: '36px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, this.questionData!.question.question, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      wordWrap: { width: width - 200 }
    }).setOrigin(0.5);

    // Proceed to answering after reading time
    this.time.delayedCall(5000, () => {
      this.startAnsweringPhase();
    });
  }

  private startAnsweringPhase() {
    this.currentPhase = "answering";
    this.answerTimeLeft = 10;
    
    // Update screen for answering
    this.children.removeAll();
    
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    this.add.text(width / 2, 100, "ANSWERING PHASE", {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 50, this.questionData!.question.question, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      wordWrap: { width: width - 300 }
    }).setOrigin(0.5);

    // Timer display
    const timerText = this.add.text(width / 2, 150, `Time remaining: ${this.answerTimeLeft}s`, {
      fontSize: '32px',
      color: '#ff0000',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Start answer timer
    this.phaseTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.answerTimeLeft--;
        timerText.setText(`Time remaining: ${this.answerTimeLeft}s`);
        
        if (this.answerTimeLeft <= 0) {
          this.finishAnsweringPhase();
        }
      },
      callbackScope: this,
      repeat: 29
    });

    // Handle answering
    this.handlePlayerAnswering();
  }

  private handlePlayerAnswering() {
    // Process human players first, then AI
    const humanPlayerIndex = this.eligiblePlayers.find(index => GameCore.players[index].isHuman);
    
    if (humanPlayerIndex !== undefined) {
      this.showHumanAnswerInput(humanPlayerIndex);
    }

    // Process AI answers with delays
    const aiPlayers = this.eligiblePlayers.filter(index => !GameCore.players[index].isHuman);
    aiPlayers.forEach((playerIndex, aiIndex) => {
      this.time.delayedCall((aiIndex + 1) * 2000, () => {
        this.processAIAnswer(playerIndex);
      });
    });
  }

  private showHumanAnswerInput(playerIndex: number) {
    const { width, height } = this.scale;

    const inputId = 'final-jeopardy-answer-input';
    const inputElement = this.add.dom(width / 2, height / 2 + 50).createFromHTML(`
      <input type="text" 
             id="${inputId}"
             placeholder="Enter your answer" 
             style="padding: 15px; font-size: 24px; width: 400px; text-align: center; border: 2px solid #0066cc; border-radius: 8px;">
    `);

    const input = inputElement.node as HTMLInputElement;
    
    // Ensure input is properly accessible
    this.time.delayedCall(100, () => {
      if (input) {
        input.focus();
      }
    });

    // Function to get input value safely
    const getInputValue = (): string => {
      // Try multiple methods to get the value
      if (input?.value !== undefined) {
        return input.value;
      }
      
      // Try getting by ID
      const inputById = document.getElementById(inputId) as HTMLInputElement;
      if (inputById?.value !== undefined) {
        return inputById.value;
      }
      
      // Try querySelector
      const inputByQuery = document.querySelector(`#${inputId}`) as HTMLInputElement;
      if (inputByQuery?.value !== undefined) {
        return inputByQuery.value;
      }
      
      return '';
    };

    const submitButton = this.add.text(width / 2, height / 2 + 120, "SUBMIT ANSWER", {
      fontSize: '28px',
      color: '#000000',
      backgroundColor: '#ffff00',
      padding: { x: 20, y: 10 },
      fontFamily: "'Swiss 911 Ultra Compressed BT'"
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      const value = getInputValue();
      console.log('Submit button clicked, input value:', value);
      this.setPlayerAnswer(playerIndex, value.trim());
      
      // Properly cleanup DOM elements
      try {
        inputElement.destroy();
      } catch (error) {
        console.warn('Error destroying input element:', error);
      }
      try {
        submitButton.destroy();
      } catch (error) {
        console.warn('Error destroying submit button:', error);
      }
    });

    // Handle Enter key
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const value = getInputValue();
        console.log('Enter pressed, input value:', value);
        this.setPlayerAnswer(playerIndex, value.trim());
        
        // Properly cleanup DOM elements
        try {
          inputElement.destroy();
        } catch (error) {
          console.warn('Error destroying input element:', error);
        }
        try {
          submitButton.destroy();
        } catch (error) {
          console.warn('Error destroying submit button:', error);
        }
      }
    });
  }

  private processAIAnswer(playerIndex: number) {
    const player = GameCore.players[playerIndex];
    const question = this.questionData!.question;
    const aiResponse = GameCore.simulateAIAnswer(question, player.difficulty || "medium");
    
    // Set AI answer (simplified - just use correct answer if AI is correct)
    const answer = aiResponse.isCorrect ? question.answer : "Wrong answer";
    this.setPlayerAnswer(playerIndex, answer);
  }

  private setPlayerAnswer(playerIndex: number, answer: string) {
    const playerWager = this.playerWagers.find(pw => pw.playerIndex === playerIndex);
    if (playerWager) {
      playerWager.answer = answer;
      playerWager.isAnswered = true;
    }
  }

  private finishAnsweringPhase() {
    if (this.phaseTimer) {
      this.phaseTimer.remove();
    }

    this.showResults();
  }

  private showResults() {
    this.currentPhase = "results";
    
    // Clear screen
    this.children.removeAll();
    
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    this.add.text(width / 2, 80, "FINAL JEOPARDY RESULTS", {
      fontSize: '60px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Show correct answer
    this.add.text(width / 2, 130, `Correct Answer: ${this.questionData!.question.answer}`, {
      fontSize: '36px',
      color: '#00ff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Process results and update scores
    let yPosition = 200;
    
    this.playerWagers.forEach((playerWager) => {
      const player = GameCore.players[playerWager.playerIndex];
      const isCorrect = this.checkAnswer(playerWager.answer, this.questionData!.question);
      
      // Update player score
      if (isCorrect) {
        player.score += playerWager.wager;
      } else {
        player.score -= playerWager.wager;
      }

      // Show result
      const resultColor = isCorrect ? '#00ff00' : '#ff0000';
      const resultText = isCorrect ? '✓' : '✗';
      
      this.add.text(width / 2, yPosition, 
        `${player.name}: ${resultText} "$${playerWager.wager}" - New Score: $${player.score}`, {
        fontSize: '32px',
        color: resultColor,
        fontFamily: "'Swiss 911 Ultra Compressed BT'",
        align: 'center'
      }).setOrigin(0.5);

      yPosition += 40;

      GameCore.eventEmitter.emit(GameEvents.SCORE_UPDATED, player);
    });

    // Show game over after delay
    this.time.delayedCall(5000, () => {
      this.handleGameOver();
    });
  }

  private checkAnswer(playerAnswer: string, question: Question): boolean {
    const normalizedPlayerAnswer = playerAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = question.answer.toLowerCase().trim();
    
    return normalizedPlayerAnswer.includes(normalizedCorrectAnswer) || 
           normalizedCorrectAnswer.includes(normalizedPlayerAnswer);
  }

  private handleGameOver() {
    GameCore.eventEmitter.emit(GameEvents.GAME_OVER);
    
    // Show final game over screen with winner and options
    this.showFinalGameOverScreen();
  }

  private showFinalGameOverScreen() {
    // Clean up any remaining DOM elements
    this.cleanupDOMElements();
    
    // Clear screen
    this.children.removeAll();
    
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    // Find winner
    const winner = GameCore.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    // Title
    this.add.text(width / 2, 150, "GAME OVER!", {
      fontSize: '96px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Winner announcement
    this.add.text(width / 2, 250, `${winner.name} WINS!`, {
      fontSize: '72px',
      color: '#00ff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Winner's final score
    this.add.text(width / 2, 320, `Final Score: $${winner.score}`, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Show all final scores
    let scoreText = "Final Standings:\n\n";
    GameCore.players
      .sort((a, b) => b.score - a.score)
      .forEach((player, index) => {
        const position = index + 1;
        const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "";
        scoreText += `${position}. ${player.name}: $${player.score} ${medal}\n`;
      });

    this.add.text(width / 2, 420, scoreText, {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add.text(width / 2 - 150, height - 150, "PLAY AGAIN", {
      fontSize: '40px',
      color: '#000000',
      backgroundColor: '#00ff00',
      padding: { x: 25, y: 15 },
      fontFamily: "'Swiss 911 Ultra Compressed BT'"
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      // Reset game and start over
      GameCore.resetGame();
      this.scene.start("game", {
        gameMode: "single-player",
        podiums: GameCore.players.map(player => ({
          name: player.name,
          price: player.score
        }))
      });
    })
    .on('pointerover', () => {
      playAgainButton.setStyle({ backgroundColor: '#00cc00' });
    })
    .on('pointerout', () => {
      playAgainButton.setStyle({ backgroundColor: '#00ff00' });
    });

    // Main Menu button
    const mainMenuButton = this.add.text(width / 2 + 150, height - 150, "MAIN MENU", {
      fontSize: '40px',
      color: '#000000',
      backgroundColor: '#ff6600',
      padding: { x: 25, y: 15 },
      fontFamily: "'Swiss 911 Ultra Compressed BT'"
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      // Return to main menu
      this.scene.start("main-menu");
    })
    .on('pointerover', () => {
      mainMenuButton.setStyle({ backgroundColor: '#cc5500' });
    })
    .on('pointerout', () => {
      mainMenuButton.setStyle({ backgroundColor: '#ff6600' });
    });
  }
} 