import { QuestionsModel, type Question } from "./models/questions.model";
import { AICore } from "./ai-core";

// Game Events Constants
export const GameEvents = {
  GAME_START: 'game:start',
  QUESTION_SELECTED: 'question:selected',
  QUESTION_READ_START: 'question:read:start',
  QUESTION_READ_COMPLETE: 'question:read:complete',
  BUZZING_ENABLED: 'buzzing:enabled',
  PLAYER_BUZZED: 'player:buzzed',
  BUZZING_ENDED: 'buzzing:ended',
  ANSWER_TIME_START: 'answer:time:start',
  ANSWER_TIME_END: 'answer:time:end',
  PLAYER_ANSWERED: 'player:answered',
  AI_ANSWERED: 'ai:answered',
  SCORE_UPDATED: 'score:updated',
  TURN_CHANGED: 'turn:changed',
  ROUND_COMPLETE: 'round:complete',
  DAILY_DOUBLE_FOUND: 'daily:double:found',
  FINAL_JEOPARDY_START: 'final:jeopardy:start',
  GAME_OVER: 'game:over',
  TIMER_START: 'timer:start',
  TIMER_END: 'timer:end'
};

// Player interface
export interface Player {
  name: string;
  score: number;
  isHuman: boolean;
  isActive: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

// Game state interface
export interface GameState {
  round: "jeopardy" | "double-jeopardy" | "final-jeopardy";
  answeredQuestions: Set<string>;
  dailyDoubleLocations: Array<{categoryIndex: number, valueIndex: number}>;
  categories: string[];
  currentQuestion: Question | null;
  currentPlayerIndex: number;
  answeringPlayerIndex: number;
}

// Buzzing state interface
export interface BuzzingState {
  isBuzzingActive: boolean;
  buzzOrder: number[];
  fastestPlayer: number;
  buzzStartTime: number;
  questionReadComplete: boolean;
}

export class GameCore {
  public static questions = new QuestionsModel();
  public static gameMode: "single-player" | "multi-player";
  public static eventEmitter = new Phaser.Events.EventEmitter();
  
  // Game state
  public static players: Player[] = [
    { name: "Player", score: 0, isHuman: true, isActive: false },
    { name: "Watson", score: 0, isHuman: false, isActive: false, difficulty: "medium" },
    { name: "Alex", score: 0, isHuman: false, isActive: false, difficulty: "medium" }
  ];
  
  public static gameState: GameState = {
    round: "jeopardy",
    answeredQuestions: new Set<string>(),
    dailyDoubleLocations: [],
    categories: [],
    currentQuestion: null,
    currentPlayerIndex: 0,
    answeringPlayerIndex: -1
  };
  
  public static buzzingState: BuzzingState = {
    isBuzzingActive: false,
    buzzOrder: [],
    fastestPlayer: -1,
    buzzStartTime: 0,
    questionReadComplete: false
  };
  
  public static resetGame() {
    this.players.forEach(player => {
      player.score = 0;
      player.isActive = false;
    });
    
    this.gameState.round = "jeopardy";
    this.gameState.answeredQuestions.clear();
    this.gameState.currentQuestion = null;
    
    // Randomly select first player
    this.gameState.currentPlayerIndex = Math.floor(Math.random() * 3);
    this.gameState.answeringPlayerIndex = -1;
    
    // Extract categories from questions
    this.extractCategories();
    
    // Generate new daily double locations
    this.setupDailyDoubles();
  }
  
  public static extractCategories() {
    const uniqueCategories = this.questions.categories;
    this.gameState.categories = uniqueCategories;
  }
  
  public static setupDailyDoubles() {
    this.gameState.dailyDoubleLocations = [];
    
    if (this.gameState.round === "jeopardy") {
      // Place one daily double randomly
      const categoryIndex = Math.floor(Math.random() * this.gameState.categories.length);
      const valueIndex = Math.floor(Math.random() * 5); // 0-4 for the 5 questions per category
      this.gameState.dailyDoubleLocations.push({ categoryIndex, valueIndex });
    } else if (this.gameState.round === "double-jeopardy") {
      // Place two daily doubles randomly
      for (let i = 0; i < 2; i++) {
        let categoryIndex: number, valueIndex: number;
        do {
          categoryIndex = Math.floor(Math.random() * this.gameState.categories.length);
          valueIndex = Math.floor(Math.random() * 5);
        } while (this.gameState.dailyDoubleLocations.some(dd => 
          dd.categoryIndex === categoryIndex && dd.valueIndex === valueIndex));
        
        this.gameState.dailyDoubleLocations.push({ categoryIndex, valueIndex });
      }
    }
  }
  
  public static advanceToNextRound() {
    if (this.gameState.round === "jeopardy") {
      this.gameState.round = "double-jeopardy";
      this.gameState.answeredQuestions.clear();
      this.setupDailyDoubles();
    } else if (this.gameState.round === "double-jeopardy") {
      this.gameState.round = "final-jeopardy";
    }
  }
  
  public static getCurrentPlayer(): Player {
    return this.players[this.gameState.currentPlayerIndex];
  }
  
  public static getHumanPlayer(): Player {
    return this.players.find(player => player.isHuman)!;
  }
  
  public static getAIPlayers(): Player[] {
    return this.players.filter(player => !player.isHuman);
  }
  
  public static nextPlayerTurn(): Player {
    this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.players.length;
    this.eventEmitter.emit(GameEvents.TURN_CHANGED, this.getCurrentPlayer());
    return this.getCurrentPlayer();
  }
  
  // Buzzing system methods
  public static startBuzzing() {
    this.buzzingState.isBuzzingActive = true;
    this.buzzingState.buzzOrder = [];
    this.buzzingState.fastestPlayer = -1;
    this.buzzingState.buzzStartTime = Date.now();
    this.buzzingState.questionReadComplete = true;
    
    this.eventEmitter.emit(GameEvents.BUZZING_ENABLED);
    
    // Allow buzzing for 30 seconds max
    setTimeout(() => {
      if (this.buzzingState.isBuzzingActive) {
        this.endBuzzing();
      }
    }, 30000);
  }
  
  public static playerBuzz(playerIndex: number): boolean {
    if (!this.buzzingState.isBuzzingActive || !this.buzzingState.questionReadComplete) {
      return false; // Can't buzz yet
    }
    
    // Check if player already buzzed
    if (this.buzzingState.buzzOrder.includes(playerIndex)) {
      return false;
    }
    
    // Record the buzz
    this.buzzingState.buzzOrder.push(playerIndex);
    this.eventEmitter.emit(GameEvents.PLAYER_BUZZED, playerIndex);
    
    // If this is the first buzz, they get to answer
    if (this.buzzingState.fastestPlayer === -1) {
      this.buzzingState.fastestPlayer = playerIndex;
      this.gameState.answeringPlayerIndex = playerIndex;
      this.buzzingState.isBuzzingActive = false; // Stop other buzzing
      this.eventEmitter.emit(GameEvents.ANSWER_TIME_START, playerIndex);
      return true;
    }
    
    return false;
  }
  
  public static endBuzzing() {
    this.buzzingState.isBuzzingActive = false;
    this.eventEmitter.emit(GameEvents.BUZZING_ENDED);
  }
  
  public static resetBuzzing() {
    this.buzzingState = {
      isBuzzingActive: false,
      buzzOrder: [],
      fastestPlayer: -1,
      buzzStartTime: 0,
      questionReadComplete: false
    };
  }
  
  // AI behavior methods
  public static simulateAIAnswer(question: Question, difficulty: string): {willAnswer: boolean, isCorrect: boolean, responseTime: number} {
    return AICore.simulateAIAnswer(question, difficulty);
  }
  
  public static simulateAIWager(player: Player, maxWager: number): number {
    return AICore.simulateAIWager(player, maxWager, this.players);
  }
  
  // AI buzzing simulation
  public static simulateAIBuzzing(aiPlayer: Player, question: Question): {willBuzz: boolean, buzzTime: number} {
    return AICore.simulateAIBuzzing(aiPlayer, question);
  }
  
  // AI question selection simulation
  public static simulateAIQuestionSelection(): {category: string, value: number} {
    const aiPlayer = this.getCurrentPlayer();
    const availableQuestions = this.getAvailableQuestions();
    return AICore.simulateAIQuestionSelection(aiPlayer, availableQuestions, this.players);
  }
  
  public static getAvailableQuestions(): Question[] {
    const allQuestions = this.questions.data;
    return allQuestions.filter((question: Question) => {
      const questionId = `${question.category}-${question.price}`;
      return !this.gameState.answeredQuestions.has(questionId);
    });
  }
  
  public static getQuestionByCategory(category: string, value: number): Question | null {
    const allQuestions = this.questions.data;
    return allQuestions.find((q: Question) => q.category === category && q.price === value) || null;
  }
  
  public static isDailyDouble(category: string, value: number): boolean {
    const categoryIndex = this.gameState.categories.indexOf(category);
    const valueIndex = this.getValueIndex(value);
    
    return this.gameState.dailyDoubleLocations.some(dd => 
      dd.categoryIndex === categoryIndex && dd.valueIndex === valueIndex
    );
  }
  
  private static getValueIndex(value: number): number {
    // Convert price to index based on current test data
    const values = [10, 25, 50, 100, 250]; // Based on current test questions
    return values.indexOf(value);
  }
  
  public static updatePlayerScore(playerIndex: number, points: number) {
    this.players[playerIndex].score += points;
    this.eventEmitter.emit(GameEvents.SCORE_UPDATED, this.players[playerIndex]);
  }
}

// Testing purposes
if (import.meta.env.DEV) {
  const questions: Question[] = [
    // CAPITALS
    {
      category: "CAPITALS",
      question: "What is the capital of France?",
      answer: "Paris",
      price: 10,
    },
    {
      category: "CAPITALS",
      question: "What is the capital of Spain?",
      answer: "Madrid",
      price: 25,
    },
    {
      category: "CAPITALS",
      question: "What is the capital of Germany?",
      answer: "Berlin",
      price: 50,
    },
    // {
    //   category: "CAPITALS",
    //   question: "What is the capital of Italy?",
    //   answer: "Rome",
    //   price: 100,
    // },
    // {
    //   category: "CAPITALS",
    //   question: "What is the capital of the United States?",
    //   answer: "Washington, D.C.",
    //   price: 250,
    // },

    // SPORTS
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Argentina?",
      answer: "Lionel Messi",
      price: 10,
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Brazil?",
      answer: "Ronaldo",
      price: 25,
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Portugal?",
      answer: "Cristiano Ronaldo",
      price: 50,
    },
    // {
    //   category: "SPORTS",
    //   question: "What is the name of the most popular player in the Spain?",
    //   answer: "Raul Gonzalez",
    //   price: 100,
    // },
    // {
    //   category: "SPORTS",
    //   question: "What is the name of the most popular player in the France?",
    //   answer: "Kylian Mbappe",
    //   price: 250,
    // },

    // CINEMA/TV
    {
      category: "CINEMA/TV",
      question: "What is the name of a serie about a man with cancer and make drugs?",
      answer: "Breaking Bad",
      price: 10,
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a movie about a man can fly, shoot laser beams with his eyes and is stronger than a human?",
      answer: "Superman",
      price: 25,
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a TV show about a man with a superpower to run at super speed?",
      answer: "The Flash",
      price: 50,
    },
    // {
    //   category: "CINEMA/TV",
    //   question: "What is the name of a movie about a ship diving in the ocean?",
    //   answer: "Titanic",
    //   price: 100,
    // },
    // {
    //   category: "CINEMA/TV",
    //   question: "What is the name of a serie about a girl playing chess?",
    //   answer: "Queen Gambit",
    //   price: 250,
    // },

    // COLORS
    {
      category: "COLORS",
      question: "What is the color of the sky?",
      answer: "Blue",
      price: 10,
    },
    {
      category: "COLORS",
      question: "What is the color of the sun?",
      answer: "Yellow",
      price: 25,
    },
    {
      category: "COLORS",
      question: "What color you get when you mix red and yellow?",
      answer: "Orange",
      price: 50,
    },
    // {
    //   category: "COLORS",
    //   question: "What color you get when you mix blue and red?",
    //   answer: "Purple",
    //   price: 100,
    // },
    // {
    //   category: "COLORS",
    //   question: "What color you get when you mix yellow and blue?",
    //   answer: "Green",
    //   price: 250,
    // },
  ];

  GameCore.questions.setQuestions(questions);
}
