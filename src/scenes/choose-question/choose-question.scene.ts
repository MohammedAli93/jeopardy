import { ChooseQuestionServices } from "./choose-question.services";
import { ChooseQuestionSceneCreator } from "./choose-question.creator";
import { GameCore, GameEvents } from "../../core/game/game-core";
import type { Question } from "../../core/game/models/questions.model";

export class ChooseQuestionScene extends Phaser.Scene {
  public creator: ChooseQuestionSceneCreator;
  public services: ChooseQuestionServices;
  private isAITurn: boolean = false;

  constructor() {
    super("choose-question");
    this.creator = new ChooseQuestionSceneCreator(this);
    this.services = new ChooseQuestionServices(this);
  }

  init() {
    console.log("ChooseQuestionScene init");
  }

  create() {
    console.log("ChooseQuestionScene create");
    this.creator.setup();
    this.services.setup();
    
    // Display round information
    this.displayRoundInfo();
    
    // Display current player turn
    this.displayCurrentPlayer();
    
    // Update question availability based on game state
    this.updateQuestionAvailability();

    // Set up question selection event
    this.events.on("question-selected", (question: Question, questionBounds: Phaser.Geom.Rectangle) => {
      this.handleQuestionSelection(question, questionBounds);
    });

    // Handle animations and AI turn logic
    if (import.meta.env.PROD) {
      this.services.disableAllInteraction();
      this.services.jeopardySmallLogoShow();
      this.services.jeopardyLargeLogoShow(this.services.getQuestions());
      this.time.delayedCall(1_000, async () => {
        await this.services.startJeopardyLargeLogoAnimation(2);
        this.time.delayedCall(500, async () => {
          await this.services.startJeopardySmallLogoAnimation();
          this.checkPlayerTurn();
        });
      });
    } else {
      // Development mode - skip animations
      this.checkPlayerTurn();
    }

    this.services.startInputAnimation();
    
    // Launch podium scene with all players
    this.scene.launch("podium", {
      podiums: GameCore.players.map(player => ({
        name: player.name,
        price: player.score
      }))
    });
  }

  private displayRoundInfo() {
    const roundTitle = GameCore.gameState.round === "jeopardy" ? "Jeopardy!" : "Double Jeopardy!";
    this.creator.createRoundInfo(roundTitle);
  }

  private displayCurrentPlayer() {
    const currentPlayer = GameCore.getCurrentPlayer();
    if(import.meta.env.DEV) {
      this.creator.createCurrentPlayerIndicator(currentPlayer.name, currentPlayer.isHuman);
    }
    
    // Animate the current player's podium to rise up
    this.time.delayedCall(1000, () => {
      this.services.storePodiumOriginalPositions();
      this.services.animateCurrentPlayerPodium(currentPlayer.name);
    });
  }

  private updateQuestionAvailability() {
    for (const categoryLabel of this.services.getCategories()) {
      const category = categoryLabel.getData("category");

      // Check if all questions are answered.
      let allQuestionsAreAnswered = true;
      const questionsLabel = this.services.getQuestionsByCategory(category);
      
      for (const questionLabel of questionsLabel) {
        const question = GameCore.questions.getQuestionByCategoryAndQuestion(
          category,
          questionLabel.getData("question")
        );
        if (!question) throw new Error("Question not found");
        
        const questionId = `${question.category}-${question.price}`;
        
        if (GameCore.gameState.answeredQuestions.has(questionId)) {
          this.services.disableInteraction(questionLabel);
          this.services.hideQuestionValue(questionLabel);
        } else {
          this.services.enableInteraction(questionLabel);
          this.services.showQuestionValue(questionLabel);
          allQuestionsAreAnswered = false;
        }
      }

      // Enable or disable the category based on the answers.
      if (allQuestionsAreAnswered) {
        this.services.disableInteraction(categoryLabel);
      }
    }
  }

  private checkPlayerTurn() {
    const currentPlayer = GameCore.getCurrentPlayer();
    this.isAITurn = !currentPlayer.isHuman;
    
    // Animate the current player's podium
    this.services.storePodiumOriginalPositions();
    this.services.animateCurrentPlayerPodium(currentPlayer.name);
    
    if (this.isAITurn) {
      // AI's turn - disable human interaction and simulate AI selection
      this.services.disableAllInteraction();
      this.handleAITurn();
    } else {
      // Human's turn - enable interaction
      this.services.enableAllInteraction();
      this.updateQuestionAvailability(); // Re-enable available questions
    }
  }

  private handleAITurn() {
    // Show AI thinking
    const thinkingText = this.creator.createAIThinkingText(GameCore.getCurrentPlayer().name);

    // Simulate AI thinking time (1-3 seconds)
    const thinkingTime = 1000 + Math.random() * 2000;
    
    this.time.delayedCall(thinkingTime, () => {
      thinkingText.destroy();
      this.performAISelection();
    });
  }

  private performAISelection() {
    const selection = GameCore.simulateAIQuestionSelection();
    
    if (selection.category && selection.value) {
      // Find the question in the UI
      const question = GameCore.getQuestionByCategory(selection.category, selection.value);
      
      if (question) {
        // Find the corresponding UI element
        const questionLabels = this.services.getQuestionsByCategory(selection.category);
        const selectedLabel = questionLabels.find(label => 
          label.getData("question") === question.question
        );
        
        if (selectedLabel) {
          // Get bounds for the selected question
          const questionBounds = selectedLabel.getBounds();
          //random delay between 1 and 5 seconds
          const randomDelay = Math.floor(Math.random() * 4000) + 1000;
          this.time.delayedCall(randomDelay, () => {
            // Simulate the selection
            this.handleQuestionSelection(question, questionBounds);
          });
        }
      }
    } else {
      // No available questions - round should be complete
      this.checkRoundCompletion();
    }
  }

  private handleQuestionSelection(question: Question, questionBounds: Phaser.Geom.Rectangle) {
    console.log("Question selected:", question);
    
    // Mark question as answered
    const questionId = `${question.category}-${question.price}`;
    GameCore.gameState.answeredQuestions.add(questionId);
    GameCore.gameState.currentQuestion = question;
    
    // Check if this is a Daily Double
    if (GameCore.isDailyDouble(question.category, question.price)) {
      GameCore.eventEmitter.emit(GameEvents.DAILY_DOUBLE_FOUND, { question });
      // TODO: Handle Daily Double logic
      console.log("Daily Double found!");
    }
    
    // Emit question selected event
    GameCore.eventEmitter.emit(GameEvents.QUESTION_SELECTED, question);
    
    // Disable all interactions
    this.services.disableAllInteraction();
    
    // Transition to clue card scene
    this.time.delayedCall(200, () => {
      // Stop podium scene before transitioning
      this.scene.stop("podium");
      
      this.renderer.snapshot((image) => {
        this.textures.addImage(
          "snapshot-choose-question",
          image as HTMLImageElement
        );
        this.scene.start("clue-card", { question, questionBounds });
      });
    });
  }

  private checkRoundCompletion() {
    const availableQuestions = GameCore.getAvailableQuestions();
    
    if (availableQuestions.length === 0) {
      // All questions answered - round complete
      GameCore.eventEmitter.emit(GameEvents.ROUND_COMPLETE);
    }
  }

  // Called when returning from clue-card scene
  resumeScene() {
    // Update display
    this.displayCurrentPlayer();
    this.updateQuestionAvailability();
    
    // Check if round is complete
    this.checkRoundCompletion();
    
    // If not complete, continue with next turn
    if (GameCore.getAvailableQuestions().length > 0) {
      this.checkPlayerTurn();
    }
  }
}
