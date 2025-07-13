import "./style.css";
import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

// Scenes
import { LoadingScene } from "./scenes/loading/loading.scene";
import { MainMenuScene } from "./scenes/main-menu/main-menu.scene";
import { GameScene } from "./scenes/game/game.scene";

document.addEventListener("DOMContentLoaded", () => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "app",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
    },
    scene: [LoadingScene, MainMenuScene, GameScene],
    plugins: {
      scene: [
        {
          key: "rexUI",
          plugin: RexUIPlugin,
          mapping: "rexUI",
        },
      ],
    },
  };

  new Phaser.Game(config);
});
