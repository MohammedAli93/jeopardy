import { GameCore } from "../../core/game/game-core";
import type { Question } from "../../core/game/models/questions.model";

interface DailyDoubleData {
  question: Question;
}

export class DailyDoubleScene extends Phaser.Scene {
  private questionData?: DailyDoubleData;
  private wagerAmount: number = 0;
  private maxWager: number = 0;
  private finderPlayerIndex: number = -1;

  constructor() {
    super("daily-double");
  }

  create(data: DailyDoubleData) {
    this.questionData = data;
    this.finderPlayerIndex = GameCore.gameState.currentPlayerIndex;
    const finderPlayer = GameCore.players[this.finderPlayerIndex];
    
    // Calculate max wager
    this.maxWager = Math.max(finderPlayer.score, 1000); // Standard Jeopardy rules
    
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");
    
    // Daily Double announcement
    const titleText = this.add.text(width / 2, height / 4, "DAILY DOUBLE!", {
      fontSize: '180px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Animate title appearance
    titleText.setScale(0);
    this.tweens.add({
      targets: titleText,
      scale: 1,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

    // Show finder
    this.add.text(width / 2, height / 2 - 100, `${finderPlayer.name} found the Daily Double!`, {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Wait for animation then show wager interface
    this.time.delayedCall(2000, () => {
      this.showWagerInterface();
    });
  }

  private showWagerInterface() {
    const { width, height } = this.scale;
    const finderPlayer = GameCore.players[this.finderPlayerIndex];

    // Clear previous text
    this.children.removeAll();
    
    // Background
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");

    // Wager prompt
    this.add.text(width / 2, height / 2 - 250, `${finderPlayer.name}, make your wager!`, {
      fontSize: '120px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Show current score and max wager
    this.add.text(width / 2, height / 2 - 100, `Current score: $${finderPlayer.score}`, {
      fontSize: '40px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 50, `Maximum wager: $${this.maxWager}`, {
      fontSize: '40px',
      color: '#ffffff',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    if (finderPlayer.isHuman) {
      this.showHumanWagerInput();
    } else {
      this.showAIWager();
    }
  }

  private showHumanWagerInput() {
    const { width, height } = this.scale;

    // Wager input instruction
    this.add.text(width / 2, height / 2 + 50, "Enter your wager:", {
      fontSize: '42px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Create wager input field with unique ID
    const inputId = 'daily-double-wager-input';
    const inputElement = this.add.dom(width / 2, height / 2 + 150).createFromHTML(`
      <input type="number" 
             id="${inputId}"
             min="0" 
             max="${this.maxWager}" 
             placeholder="Enter wager amount" 
             style="padding: 20px; font-size: 32px; width: 400px; text-align: center; border: 3px solid #0066cc; border-radius: 10px;">
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
        console.log('Got value from direct reference:', input.value);
        return input.value;
      }
      
      // Try getting by ID
      const inputById = document.getElementById(inputId) as HTMLInputElement;
      if (inputById?.value !== undefined) {
        console.log('Got value from getElementById:', inputById.value);
        return inputById.value;
      }
      
      // Try querySelector
      const inputByQuery = document.querySelector(`#${inputId}`) as HTMLInputElement;
      if (inputByQuery?.value !== undefined) {
        console.log('Got value from querySelector:', inputByQuery.value);
        return inputByQuery.value;
      }
      
      console.log('Could not get input value, returning empty string');
      return '';
    };

    // Submit button
    this.add.text(width / 2, height / 2 + 300, "SUBMIT WAGER", {
      fontSize: '40px',
      color: '#000000',
      backgroundColor: '#ffff00',
      padding: { x: 25, y: 15 },
      fontFamily: "'Swiss 911 Ultra Compressed BT'"
    }).setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => {
      const value = getInputValue();
      console.log('Button clicked, input value:', value);
      this.submitWager(this.parseWagerInput(value));
    });

    // Handle Enter key
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const value = getInputValue();
        console.log('Enter pressed, input value:', value);
        this.submitWager(this.parseWagerInput(value));
      }
    });

    // Also try input event to track changes
    input.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      console.log('Input changed, new value:', target.value);
    });
  }

  private showAIWager() {
    const { width, height } = this.scale;
    const finderPlayer = GameCore.players[this.finderPlayerIndex];

    // Show AI thinking
    this.add.text(width / 2, height / 2 + 50, `${finderPlayer.name} is considering their wager...`, {
      fontSize: '42px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // AI wager calculation
    this.time.delayedCall(2000 + Math.random() * 2000, () => {
      const aiWager = GameCore.simulateAIWager(finderPlayer, this.maxWager);
      this.submitWager(Number(aiWager));
    });
  }

  private parseWagerInput(inputValue: string): number {
    console.log('Input value received:', inputValue, 'Type:', typeof inputValue);
    
    // Handle empty or null input
    if (!inputValue || inputValue.trim() === '') {
      console.log('Input is empty or null');
      return NaN;
    }
    
    // Parse the input value to a number
    const parsedValue = parseInt(inputValue.trim(), 10);
    console.log('Parsed value:', parsedValue);
    
    // Return the parsed value (could be NaN if invalid)
    return parsedValue;
  }

  private submitWager(wager: number) {
    // Validate wager - must be a valid number between 0 and maximum wager
    if (isNaN(wager)) {
      this.showInvalidWager("Please enter a valid number!");
      return;
    }
    
    if (wager < 0) {
      this.showInvalidWager("Wager cannot be negative!");
      return;
    }
    
    if (wager > this.maxWager) {
      this.showInvalidWager(`Wager cannot exceed $${this.maxWager}!`);
      return;
    }

    this.wagerAmount = wager;
    
    // Clean up DOM elements first
    this.cleanupDOMElements();
    
    // Show confirmed wager
    const { width, height } = this.scale;
    this.children.removeAll();
    
    this.add.image(width / 2, height / 2, "scenes.clue-card.background");
    
    const finderPlayer = GameCore.players[this.finderPlayerIndex];
    this.add.text(width / 2, height / 2, `${finderPlayer.name} wagers $${this.wagerAmount}!`, {
      fontSize: '56px',
      color: '#ffff00',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Proceed to question after delay
    this.time.delayedCall(2000, () => {
      this.proceedToQuestion();
    });
  }

  private showInvalidWager(customMessage?: string) {
    // Show error and return to wager input
    const { width, height } = this.scale;
    
    const defaultMessage = `Invalid wager! Must be between $0 and $${this.maxWager}`;
    const message = customMessage || defaultMessage;
    
    const errorText = this.add.text(width / 2, height / 2 + 250, message, {
      fontSize: '32px',
      color: '#ff0000',
      fontFamily: "'Swiss 911 Ultra Compressed BT'",
      align: 'center'
    }).setOrigin(0.5);

    // Remove error after 3 seconds and allow retry
    this.time.delayedCall(3000, () => {
      errorText.destroy();
    });
  }

  private proceedToQuestion() {
    // Launch podium to show all players
    this.scene.launch("podium", {
      podiums: GameCore.players.map(player => ({
        name: player.name,
        price: player.score
      })),
      isDailyDouble: true,
      finderIndex: this.finderPlayerIndex
    });

    // Set up special Daily Double question data
    const questionBounds = new Phaser.Geom.Rectangle(0, 0, 100, 100); // Placeholder bounds
    const specialQuestionData = {
      question: this.questionData!.question,
      questionBounds,
      isDailyDouble: true,
      wagerAmount: this.wagerAmount,
      finderPlayerIndex: this.finderPlayerIndex
    };

    // Transition to clue card with Daily Double data
    this.scene.start("clue-card", specialQuestionData);
  }

  private cleanupDOMElements() {
    // Remove any existing DOM elements from this scene
    const inputById = document.getElementById('daily-double-wager-input');
    if (inputById) {
      inputById.remove();
    }
    
    // Also try to clean up any other DOM elements that might be hanging around
    const domElements = document.querySelectorAll('[id*="daily-double"]');
    domElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }

  init() {
    // Set up cleanup when scene shuts down
    this.events.once('shutdown', () => {
      this.cleanupDOMElements();
    });
  }
} 