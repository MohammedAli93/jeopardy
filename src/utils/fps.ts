export class FPSIndicator {
  scene: Phaser.Scene;
  private fpsText: Phaser.GameObjects.Text;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  constructor(scene: Phaser.Scene, x: number = 20, y: number = 20) {
    this.scene = scene;
    
    // Create FPS text display
    this.fpsText = scene.add.text(x, y, 'FPS: --', {
      fontSize: '26px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
      fontFamily: 'Arial'
    });
    
    // Set depth to ensure it's always on top
    this.fpsText.setDepth(10000);
    this.fpsText.setScrollFactor(0); // Keep it fixed on screen
    
    // Start tracking
    this.lastTime = performance.now();
  }

  update(): void {
    const currentTime = performance.now();
    this.frameCount++;

    // Update FPS every 500ms
    if (currentTime - this.lastTime >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Update text with color coding
      let color = '#00ff00'; // Green for good FPS
      if (this.fps < 30) {
        color = '#ff0000'; // Red for poor FPS
      } else if (this.fps < 50) {
        color = '#ffff00'; // Yellow for medium FPS
      }
      
      this.fpsText.setColor(color);
      this.fpsText.setText(`FPS: ${this.fps}`);
    }
  }

  setVisible(visible: boolean): void {
    this.fpsText.setVisible(visible);
  }

  setPosition(x: number, y: number): void {
    this.fpsText.setPosition(x, y);
  }

  destroy(): void {
    if (this.fpsText) {
      this.fpsText.destroy();
    }
  }
}

// Helper function to easily add FPS indicator to any scene
export function addFPSIndicator(scene: Phaser.Scene, x?: number, y?: number): FPSIndicator {
  return new FPSIndicator(scene, x, y);
} 