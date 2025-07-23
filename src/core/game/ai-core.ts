import type { Player } from "./game-core";
import type { Question } from "./models/questions.model";

export class AICore {
  /**
   * Simulates an AI player's response to a question.
   * @param question The question to answer.
   * @param difficulty The difficulty of the AI.
   * @returns An object with whether the AI will answer, if it's correct, and response time.
   */
  public static simulateAIAnswer(question: Question, difficulty: string): {willAnswer: boolean, isCorrect: boolean, responseTime: number} {
    // Determine if AI will answer and if it's correct based on difficulty
    let correctProbability = 0;
    let responseTime = 0;
    
    switch(difficulty) {
      case "easy":
        correctProbability = 0.5; // 50% chance to be correct
        responseTime = 2000 + Math.random() * 1000; // 2-3 seconds
        break;
      case "medium":
        correctProbability = 0.7; // 70% chance to be correct
        responseTime = 1500 + Math.random() * 1000; // 1.5-2.5 seconds
        break;
      case "hard":
        correctProbability = 0.85; // 85% chance to be correct
        responseTime = 1000 + Math.random() * 1000; // 1-2 seconds
        break;
    }
    
    // Higher value questions are harder to answer
    const questionDifficulty = question.price / 250; // Normalized difficulty based on current test data
    correctProbability *= (1 - questionDifficulty * 0.2); // Reduce probability for harder questions
    
    const willAnswer = Math.random() < 0.8; // 80% chance AI will attempt to answer
    const isCorrect = Math.random() < correctProbability;
    
    return { willAnswer, isCorrect, responseTime };
  }

  /**
   * Simulates an AI player's wager.
   * @param player The AI player.
   * @param maxWager The maximum possible wager.
   * @param players All players in the game.
   * @returns The wager amount.
   */
  public static simulateAIWager(player: Player, maxWager: number, players: Player[]): number {
    // Simulate AI wagering strategy based on difficulty
    const difficulty = player.difficulty || "medium";
    let wagerPercentage = 0;
    
    switch(difficulty) {
      case "easy":
        wagerPercentage = 0.3 + Math.random() * 0.2; // 30-50% of max
        break;
      case "medium":
        wagerPercentage = 0.5 + Math.random() * 0.2; // 50-70% of max
        break;
      case "hard":
        // More strategic wagering based on game state
        const leadingScore = Math.max(...players.map(p => p.score));
        if (player.score > leadingScore * 0.8) {
          // If close to leading, wager more
          wagerPercentage = 0.7 + Math.random() * 0.3; // 70-100%
        } else {
          // If behind, more conservative
          wagerPercentage = 0.4 + Math.random() * 0.3; // 40-70%
        }
        break;
    }
    
    return Math.floor(maxWager * wagerPercentage);
  }

  /**
   * Simulates an AI player's buzzing behavior.
   * @param aiPlayer The AI player.
   * @param question The question being asked.
   * @returns An object with whether the AI will buzz and the buzz time.
   */
  public static simulateAIBuzzing(aiPlayer: Player, question: Question): {willBuzz: boolean, buzzTime: number} {
    const aiResponse = this.simulateAIAnswer(question, aiPlayer.difficulty || "medium");
    
    if (!aiResponse.willAnswer) {
      return { willBuzz: false, buzzTime: 0 };
    }
    
    // AI buzz time based on difficulty and confidence
    let buzzTime = 0;
    switch(aiPlayer.difficulty) {
      case "easy":
        buzzTime = 1500 + Math.random() * 2000; // 1.5-3.5 seconds
        break;
      case "medium":
        buzzTime = 800 + Math.random() * 1500; // 0.8-2.3 seconds
        break;
      case "hard":
        buzzTime = 300 + Math.random() * 1000; // 0.3-1.3 seconds
        break;
    }
    
    return { willBuzz: true, buzzTime };
  }

  /**
   * Simulates an AI player's question selection.
   * @param aiPlayer The current AI player.
   * @param availableQuestions The list of available questions.
   * @param players All players in the game.
   * @returns The category and value of the selected question.
   */
  public static simulateAIQuestionSelection(aiPlayer: Player, availableQuestions: Question[], players: Player[]): {category: string, value: number} {
    if (availableQuestions.length === 0) {
      // No questions available, should not happen
      return { category: "", value: 0 };
    }
    
    // AI strategy: prefer higher value questions when ahead, lower when behind
    const leadingScore = Math.max(...players.map(p => p.score));
    
    let preferredQuestions;
    if (aiPlayer.score > leadingScore * 0.8) {
      // If AI is ahead or close, prefer higher value questions
      preferredQuestions = availableQuestions.sort((a, b) => b.price - a.price);
    } else {
      // If AI is behind, prefer medium value questions
      preferredQuestions = availableQuestions.sort((a, b) => 
        Math.abs(b.price - 30) - Math.abs(a.price - 30) // Based on current test data range
      );
    }
    
    // Select one of the top 3 preferred questions
    const selectedIndex = Math.floor(Math.random() * Math.min(3, preferredQuestions.length));
    const selectedQuestion = preferredQuestions[selectedIndex];
    
    return { category: selectedQuestion.category, value: selectedQuestion.price };
  }
} 