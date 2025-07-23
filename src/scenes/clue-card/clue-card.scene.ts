import type { Question } from "../../core/game/models/questions.model";
import { ClueCardSceneCreator } from "./clue-card.creator";
import { ClueCardServices } from "./clue-card.services";
import { GameCore, GameEvents } from "../../core/game/game-core";
import { AICore } from "../../core/game/ai-core";

export interface ClueCardSceneData {
  question: Question;
  questionBounds: Phaser.Geom.Rectangle;
  isDailyDouble?: boolean;
  wagerAmount?: number;
  finderPlayerIndex?: number;
}

export class ClueCardScene extends Phaser.Scene {
  public creator: ClueCardSceneCreator;
  public services: ClueCardServices;
  
  private questionReadTimer: Phaser.Time.TimerEvent | null = null;
  private answerTimer: Phaser.Time.TimerEvent | null = null;
  private buzzingTimer: Phaser.Time.TimerEvent | null = null;
  private aiBuzzTimers: Phaser.Time.TimerEvent[] = [];
  private questionText: string = "";
  private currentWordIndex: number = 0;
  private words: string[] = [];
  private questionData: ClueCardSceneData | null = null;
  private buzzingPhase: boolean = false;
  private someoneBuzzed: boolean = false;

  constructor() {
    super("clue-card");
    this.creator = new ClueCardSceneCreator(this);
    this.services = new ClueCardServices(this);
  }

  init() {
    console.log("ClueCardScene init");
  }

  async create(data: ClueCardSceneData) {
    console.log("ClueCardScene create");
    this.scene.stop("hud");
    
    // Reset state
    this.questionData = data;
    this.questionText = data.question.question;
    this.words = this.questionText.split(' ');
    this.buzzingPhase = false;
    this.someoneBuzzed = false;
    
    // Reset buzzing state
    GameCore.resetBuzzing();
    
    // Hide podium during question reading/buzzing
    this.scene.stop("podium");
    
    // Setup visual elements
    this.creator.setup(data);
    await this.services.startZoomInAnimation();
    this.services.disappearSnapshot();
    await Promise.all([
      this.services.startBackgroundToWhiteBackgroundAnimation(),
      this.services.startShowHeaderAnimation(),
    ]);
    
    // Start reading the question
    this.startReadingQuestion();
    
    // Set up human buzzing (spacebar)
    this.input.keyboard?.on('keydown-SPACE', this.handleHumanBuzz, this);
    
    // Set up AI buzzing timers (will be started after question reading)
    this.setupAIBuzzTimers(data.question);
  }

  private startReadingQuestion() {
    this.currentWordIndex = 0;
    
    GameCore.eventEmitter.emit(GameEvents.QUESTION_READ_START);
    
    // Show initial instruction
    this.creator.createInstructionText("Listen to the question...");
    
    // Display question text area
    this.creator.createQuestionDisplay();
    
    // Display question text word by word
    this.questionReadTimer = this.time.addEvent({
      delay: 200, // 200ms per word (readable speed)
      callback: this.readNextWord,
      callbackScope: this,
      repeat: this.words.length - 1
    });
  }

  private readNextWord() {
    // Display words progressively
    const currentText = this.words.slice(0, this.currentWordIndex + 1).join(' ');
    const questionDisplay = this.children.getByName('question-display') as Phaser.GameObjects.Text;
    
    if (questionDisplay && questionDisplay.active && this.scene.isActive()) {
      try {
        questionDisplay.setText(currentText);
      } catch (error) {
        console.warn("Error updating question display text:", error);
      }
    }
    
    this.currentWordIndex++;
    
    // If finished reading, enable buzzing
    if (this.currentWordIndex >= this.words.length) {
      this.finishReadingQuestion();
    }
  }

  private finishReadingQuestion() {
    this.buzzingPhase = true;
    
    GameCore.buzzingState.questionReadComplete = true;
    GameCore.eventEmitter.emit(GameEvents.QUESTION_READ_COMPLETE);
    
    const questionDisplay = this.children.getByName('question-display') as Phaser.GameObjects.Text;
    if (questionDisplay) {
      questionDisplay.setText("");
    }
    
    // Handle Daily Double - no buzzing, only the finder answers
    if (this.questionData!.isDailyDouble) {
      const finderIndex = this.questionData!.finderPlayerIndex!;
      const finderPlayer = GameCore.players[finderIndex];
      
      this.creator.updateInstructionText(`${finderPlayer.name} will now answer the Daily Double!`, '#ffff00');
      
      // Automatically start answer phase for the finder
      this.time.delayedCall(1000, () => {
        this.startAnswerPhase(finderIndex);
      });
      return;
    }
    
    // Regular buzzing logic
    GameCore.startBuzzing();
    GameCore.eventEmitter.emit(GameEvents.BUZZING_ENABLED);
    
    // Update instruction
    this.creator.updateInstructionText("Press SPACEBAR to buzz in!", '#00ff00');
    
    // Start 8-second buzzing timer
    this.startBuzzingTimer();
    
    // Start AI buzzing attempts
    this.startAIBuzzAttempts();
  }

  private startBuzzingTimer() {
    // Show buzzing countdown
    const timerText = this.creator.createBuzzingTimer();
    
    let timeLeft = 8;
    
    this.buzzingTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--;
        
        // Check if the text object still exists and scene is active
        if (timerText && timerText.active && this.scene.isActive()) {
          try {
            timerText.setText(timeLeft.toString());
          } catch (error) {
            console.warn("Error updating timer text:", error);
          }
        }
        
        if (timeLeft <= 0) {
          this.handleBuzzingTimeout();
        }
      },
      callbackScope: this,
      repeat: 7 // 8 seconds total
    });
  }

  private setupAIBuzzTimers(question: Question) {
    // Pre-calculate AI buzzing data but don't start timers yet
    this.aiBuzzTimers = [];
    
    GameCore.getAIPlayers().forEach((aiPlayer) => {
      const buzzData = AICore.simulateAIBuzzing(aiPlayer, question);
      
      if (buzzData.willBuzz) {
        // Store the timer creation for later
        const playerIndex = GameCore.players.indexOf(aiPlayer);
        const aiTimerData = {
          playerIndex,
          delay: buzzData.buzzTime,
          aiPlayer
        };
        // Store this for when buzzing starts
        (aiPlayer as any).buzzTimerData = aiTimerData;
      }
    });
  }

  private startAIBuzzAttempts() {
    // Now start the AI buzz timers with realistic delays within 8 seconds
    GameCore.getAIPlayers().forEach((aiPlayer) => {
      const buzzTimerData = (aiPlayer as any).buzzTimerData;
      if (buzzTimerData) {
        // Ensure AI buzzing happens within the 8-second window
        // Make AI buzzing more realistic - between 1-7 seconds
        let adjustedDelay = buzzTimerData.delay;
        
        // Adjust delay based on difficulty but keep within 1-7 second range
        switch (aiPlayer.difficulty) {
          case "easy":
            adjustedDelay = 3000 + Math.random() * 4000; // 3-7 seconds
            break;
          case "medium":
            adjustedDelay = 2000 + Math.random() * 4000; // 2-6 seconds
            break;
          case "hard":
            adjustedDelay = 1000 + Math.random() * 3000; // 1-4 seconds
            break;
        }
        
        const timer = this.time.delayedCall(adjustedDelay, () => {
          if (this.buzzingPhase && !this.someoneBuzzed) {
            this.handleAIBuzz(buzzTimerData.playerIndex);
          }
        });
        
        this.aiBuzzTimers.push(timer);
      }
    });
  }

  private handleBuzzingTimeout() {
    // No one buzzed in 8 seconds
    if (!this.someoneBuzzed) {
      this.buzzingPhase = false;
      this.cancelAllTimers();
      
      // Update instruction
      this.creator.updateInstructionText("Time's up! No one buzzed. Here's the correct answer:", '#ff0000');
      
      // Show correct answer
      this.showCorrectAnswer();
      
      // Return to question board after delay - give time to read the answer
      this.time.delayedCall(4000, () => {
        this.returnToQuestionBoard();
      });
    }
  }

  private handleHumanBuzz = () => {
    if (!this.buzzingPhase || !GameCore.buzzingState.questionReadComplete) {
      // Too early! Show penalty
      this.showEarlyBuzzPenalty();
      return;
    }
    
    if (this.someoneBuzzed) {
      return; // Someone already buzzed
    }
    
    const humanPlayerIndex = GameCore.players.findIndex(p => p.isHuman);
    
    // Check if human player already buzzed for this question
    if (GameCore.buzzingState.buzzOrder.includes(humanPlayerIndex)) {
      // Show message that they already tried
      this.creator.updateInstructionText("You already tried to answer this question!", '#ff0000');
      return;
    }
    
    const success = GameCore.playerBuzz(humanPlayerIndex);
    
    if (success) {
      // Human buzzed first!
      this.someoneBuzzed = true;
      this.cancelAllTimers();
      this.showPlayerPodium(humanPlayerIndex);
      this.startAnswerPhase(humanPlayerIndex);
    }
  }

  private handleAIBuzz(playerIndex: number) {
    if (!GameCore.buzzingState.isBuzzingActive || !this.buzzingPhase || this.someoneBuzzed) {
      return; // Someone already buzzed or buzzing not active
    }
    
    // Check if this AI player already buzzed for this question
    if (GameCore.buzzingState.buzzOrder.includes(playerIndex)) {
      return; // This player already tried
    }
    
    const success = GameCore.playerBuzz(playerIndex);
    
    if (success) {
      // AI buzzed first!
      this.someoneBuzzed = true;
      this.cancelAllTimers();
      this.showAIBuzzed(GameCore.players[playerIndex].name);
      this.showPlayerPodium(playerIndex);
      
      // Short delay then start AI answer
      this.time.delayedCall(500, () => {
        this.startAnswerPhase(playerIndex);
      });
    }
  }

  private showPlayerPodium(playerIndex: number) {
    // Show only the buzzing player's podium, not all podiums
    const player = GameCore.players[playerIndex];
    
    // Create a single podium for the buzzing player
    this.scene.launch("podium", {
      podiums: [
        { name: player.name, price: player.score }
      ],
      isBuzzed: true
    });
    
    // Emit the buzz event for visual feedback
    GameCore.eventEmitter.emit(GameEvents.PLAYER_BUZZED, playerIndex);
  }

  private cancelAllTimers() {
    // Cancel buzzing timer
    if (this.buzzingTimer) {
      this.buzzingTimer.remove();
      this.buzzingTimer = null;
    }
    
    // Cancel AI timers
    this.aiBuzzTimers.forEach(timer => {
      if (timer) {
        timer.remove();
      }
    });
    this.aiBuzzTimers = [];
    
    // Remove buzzing timer display
    const timerText = this.children.getByName('buzzing-timer');
    if (timerText && timerText.active) {
      try {
        timerText.destroy();
      } catch (error) {
        console.warn("Error destroying timer text:", error);
      }
    }
  }

  private startAnswerPhase(playerIndex: number) {
    this.buzzingPhase = false;
    
    // GameCore.eventEmitter.emit(GameEvents.ANSWER_TIME_START);
    
    const player = GameCore.players[playerIndex];
    
    // Update instruction
    if (player.isHuman) {
      this.creator.updateInstructionText("You buzzed! Enter your answer below:", '#ffff00');
    } else {
      this.creator.updateInstructionText(`${player.name} is answering...`, '#ffff00');
    }
    
    // Show 5-second answer timer
    this.showAnswerTimer();
    
    if (player.isHuman) {
      // Show answer input for human
      this.showAnswerInput();
      
      // Start 5-second timer
      this.answerTimer = this.time.addEvent({
        delay: 5000,
        callback: () => this.handleAnswerTimeout(playerIndex),
        callbackScope: this
      });
      
    } else {
      // AI answers
      this.handleAIAnswer(playerIndex);
    }
  }

  private showAnswerTimer() {
    const answerTimerText = this.creator.createAnswerTimer();
    
    let timeLeft = 5;
    
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--;
        
        // Check if the text object still exists and scene is active
        if (answerTimerText && answerTimerText.active && this.scene.isActive()) {
          try {
            if (timeLeft > 0) {
              answerTimerText.setText(timeLeft.toString());
            } else {
              answerTimerText.destroy();
            }
          } catch (error) {
            console.warn("Error updating answer timer text:", error);
          }
        }
      },
      callbackScope: this,
      repeat: 4 // 5 seconds total
    });
  }

  private showAnswerInput() {
    // Create answer input UI
    const { inputText } = this.creator.createAnswerInput();
    
    // Track current input
    let currentInput = "";
    
    // Handle keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (this.answerTimer && currentInput.trim().length > 0) {
          this.handleHumanAnswerSubmit(currentInput.trim());
        }
      } else if (event.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        if (inputText && inputText.active) {
          inputText.setText(currentInput || "Type here and press ENTER");
          inputText.setColor(currentInput ? '#000000' : '#666666');
        }
      } else if (event.key.length === 1 && currentInput.length < 50) {
        // Add character if it's printable and not too long
        currentInput += event.key;
        if (inputText && inputText.active) {
          inputText.setText(currentInput);
          inputText.setColor('#000000');
        }
      }
    });
  }

  private handleHumanAnswerSubmit(answer: string) {
    if (this.answerTimer) {
      this.answerTimer.remove();
      this.answerTimer = null;
    }
    
    this.clearAnswerTimer();
    
    const humanPlayerIndex = GameCore.players.findIndex(p => p.isHuman);
    const isCorrect = this.checkAnswer(answer, this.questionData!.question);
    
    this.processAnswer(humanPlayerIndex, isCorrect);
  }

  private handleAIAnswer(playerIndex: number) {
    const aiPlayer = GameCore.players[playerIndex];
    const question = this.questionData!.question;
    
    // Simulate AI thinking time (1-3 seconds)
    const thinkingTime = 1000 + Math.random() * 2000;
    
    this.time.delayedCall(thinkingTime, () => {
      const aiResponse = AICore.simulateAIAnswer(question, aiPlayer.difficulty || "medium");
      this.showAIAnswer(aiPlayer.name, aiResponse.isCorrect);
      
      this.time.delayedCall(1000, () => {
        this.clearAnswerTimer();
        this.processAnswer(playerIndex, aiResponse.isCorrect);
      });
    });
  }

  private handleAnswerTimeout(playerIndex: number) {
    // Player didn't answer in time
    this.clearAnswerTimer();
    this.showTimeoutMessage();
    
    this.time.delayedCall(1000, () => {
      this.processAnswer(playerIndex, false);
    });
  }

  private clearAnswerTimer() {
    // Clear answer timer display
    const answerTimerText = this.children.getByName('answer-timer');
    if (answerTimerText && answerTimerText.active) {
      try {
        answerTimerText.destroy();
      } catch (error) {
        console.warn("Error destroying answer timer text:", error);
      }
    }
    
    // Clear input elements
    const elementsToDestroy = ['answer-prompt', 'input-background', 'input-text'];
    elementsToDestroy.forEach(elementName => {
      const element = this.children.getByName(elementName);
      if (element && element.active) {
        try {
          element.destroy();
        } catch (error) {
          console.warn(`Error destroying ${elementName}:`, error);
        }
      }
    });
  }

  private processAnswer(playerIndex: number, isCorrect: boolean) {
    const player = GameCore.players[playerIndex];
    const question = this.questionData!.question;
    
    // Handle Daily Double scoring
    if (this.questionData!.isDailyDouble) {
      const wager = this.questionData!.wagerAmount || question.price;
      const finderIndex = this.questionData!.finderPlayerIndex!;
      
      // Only the finder can answer in Daily Double
      if (playerIndex === finderIndex) {
        if (isCorrect) {
          player.score += wager;
          GameCore.gameState.currentPlayerIndex = playerIndex; // Keep same player for next selection
        } else {
          player.score -= wager;
        }
        
        GameCore.eventEmitter.emit(GameEvents.SCORE_UPDATED, player);
        this.showResultMessage(isCorrect, question.answer);
        
        // Return to question selection after delay
        this.time.delayedCall(3000, () => {
          this.returnToQuestionBoard();
        });
      }
      return;
    }
    
    // Regular question scoring
    if (isCorrect) {
      player.score += question.price;
      // Correct answerer gets to pick next question
      GameCore.gameState.currentPlayerIndex = playerIndex;
      
      GameCore.eventEmitter.emit(GameEvents.SCORE_UPDATED, player);
      this.showResultMessage(true, question.answer);
      
    } else {
      player.score -= question.price;
      GameCore.eventEmitter.emit(GameEvents.SCORE_UPDATED, player);
      
      // Check if there are other players who haven't tried yet
      const remainingPlayers = GameCore.players.filter((_, index) => 
        !GameCore.buzzingState.buzzOrder.includes(index)
      );
      
      if (remainingPlayers.length > 0) {
        // Show wrong answer and allow others to buzz
        this.showResultMessage(false, "Incorrect!");
        this.time.delayedCall(2000, () => {
          this.allowRebuzzing();
        });
        return;
      } else {
        // No more players to try, show correct answer and continue
        this.showResultMessage(false, question.answer);
      }
    }
    
    // Return to question selection after delay
    this.time.delayedCall(3000, () => {
      this.returnToQuestionBoard();
    });
  }

  private allowRebuzzing() {
    // Check if there are any players left who haven't buzzed
    const remainingPlayers = GameCore.players.filter((_, index) => 
      !GameCore.buzzingState.buzzOrder.includes(index)
    );
    
    if (remainingPlayers.length === 0) {
      // No more players to buzz, show correct answer and continue
      this.buzzingPhase = false;
      this.creator.updateInstructionText("No more players can buzz. Showing correct answer...", '#ff0000');
      this.showCorrectAnswer();
      
      this.time.delayedCall(3000, () => {
        this.returnToQuestionBoard();
      });
      return;
    }
    
    // Reset buzzing state but keep track of players who already answered
    const previousBuzzOrder = [...GameCore.buzzingState.buzzOrder];
    GameCore.resetBuzzing();
    GameCore.buzzingState.buzzOrder = previousBuzzOrder; // Restore the buzz order to prevent re-buzzing
    GameCore.buzzingState.questionReadComplete = true;
    GameCore.startBuzzing();
    
    this.buzzingPhase = true;
    this.someoneBuzzed = false;
    
    // Hide the single player podium
    this.scene.stop("podium");
    
    // Update instruction to show remaining players
    const remainingPlayerNames = remainingPlayers.map(p => p.name).join(", ");
    this.creator.updateInstructionText(`Remaining players (${remainingPlayerNames}) can buzz in!`, '#00ff00');
    
    // Start new buzzing timer (shorter since some players already tried)
    this.startBuzzingTimer();
    
    // Only start AI buzz attempts for players who haven't tried yet
    this.startAIBuzzAttemptsForRemainingPlayers();
  }

  private startAIBuzzAttemptsForRemainingPlayers() {
    // Start AI buzz attempts only for players who haven't buzzed yet
    GameCore.getAIPlayers().forEach((aiPlayer) => {
      const playerIndex = GameCore.players.indexOf(aiPlayer);
      
      // Skip if this player already buzzed
      if (GameCore.buzzingState.buzzOrder.includes(playerIndex)) {
        console.log(`AI Player ${aiPlayer.name} (index ${playerIndex}) already buzzed, skipping`);
        return;
      }
      
      console.log(`AI Player ${aiPlayer.name} (index ${playerIndex}) is eligible to buzz again`);
      
      const buzzTimerData = (aiPlayer as any).buzzTimerData;
      if (buzzTimerData) {
        // Shorter delays for remaining attempts
        let adjustedDelay = buzzTimerData.delay * 0.7; // Make it 30% faster
        
        // Adjust delay based on difficulty but keep within 1-5 second range
        switch (aiPlayer.difficulty) {
          case "easy":
            adjustedDelay = 2000 + Math.random() * 3000; // 2-5 seconds
            break;
          case "medium":
            adjustedDelay = 1500 + Math.random() * 2500; // 1.5-4 seconds
            break;
          case "hard":
            adjustedDelay = 800 + Math.random() * 2200; // 0.8-3 seconds
            break;
        }
        
        const timer = this.time.delayedCall(adjustedDelay, () => {
          // Double-check the player hasn't buzzed since timer was created
          if (this.buzzingPhase && !this.someoneBuzzed && !GameCore.buzzingState.buzzOrder.includes(playerIndex)) {
            console.log(`AI Player ${aiPlayer.name} attempting to buzz`);
            this.handleAIBuzz(playerIndex);
          }
        });
        
        this.aiBuzzTimers.push(timer);
      }
    });
  }

  private checkAnswer(playerAnswer: string, question: Question): boolean {
    // Simple answer checking - in a real implementation, this would be more sophisticated
    const normalizedPlayerAnswer = playerAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = question.answer.toLowerCase().trim();
    
    // Check for partial matches or common variations
    return normalizedPlayerAnswer.includes(normalizedCorrectAnswer) || 
           normalizedCorrectAnswer.includes(normalizedPlayerAnswer);
  }

  private showEarlyBuzzPenalty() {
    const penaltyText = this.creator.createPenaltyMessage("Wait for the question to finish!");
    
    this.time.delayedCall(2000, () => {
      penaltyText.destroy();
    });
  }

  private showAIBuzzed(aiName: string) {
    this.creator.createBuzzMessage(`${aiName} buzzed in!`);
  }

  private showAIAnswer(aiName: string, isCorrect: boolean) {
    const aiAnswerText = isCorrect ? "gives the correct answer!" : "gives an incorrect answer.";
    const color = isCorrect ? '#00ff00' : '#ff0000';
    
    this.creator.updateInstructionText(`${aiName} ${aiAnswerText}`, color);
  }

  private showResultMessage(isCorrect: boolean, correctAnswer: string) {
    const message = isCorrect ? "Correct!" : `Incorrect! The answer is: ${correctAnswer}`;
    const color = isCorrect ? '#00ff00' : '#ff0000';
    
    this.creator.createResultMessage(message, color);
  }

  private showCorrectAnswer() {
    if (this.questionData) {
      this.showResultMessage(false, this.questionData.question.answer);
    }
  }

  private showTimeoutMessage() {
    this.creator.updateInstructionText("Time's up!", '#ff0000');
  }

  private returnToQuestionBoard() {
    // Clean up all state and timers
    this.cleanupScene();
    
    // Stop any existing podium scene
    this.scene.stop("podium");
    
    // Launch full podium scene with all players
    this.scene.launch("podium", {
      podiums: GameCore.players.map(player => ({
        name: player.name,
        price: player.score
      }))
    });
    
    // Return to choose-question scene
    this.scene.start("choose-question");
  }

  private cleanupScene() {
    // Clean up all timers
    try {
      if (this.questionReadTimer) {
        this.questionReadTimer.remove();
        this.questionReadTimer = null;
      }
      if (this.answerTimer) {
        this.answerTimer.remove();
        this.answerTimer = null;
      }
      if (this.buzzingTimer) {
        this.buzzingTimer.remove();
        this.buzzingTimer = null;
      }
      this.cancelAllTimers();
    } catch (error) {
      console.warn("Error cleaning up timers:", error);
    }
    
    // Clean up keyboard listeners
    try {
      this.input.keyboard?.removeAllListeners();
    } catch (error) {
      console.warn("Error removing keyboard listeners:", error);
    }
    
    // Reset state
    this.buzzingPhase = false;
    this.someoneBuzzed = false;
    this.questionData = null;
  }

  destroy() {
    this.cleanupScene();
  }
}
