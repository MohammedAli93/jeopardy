import "./style.css";
import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import PerspectiveImagePlugin from 'phaser3-rex-plugins/plugins/perspectiveimage-plugin.js'

// Pipelines
import CurvedPostFX from "./pipelines/curved-post-fx";

// Scenes
import { LoadingScene } from "./scenes/loading/loading.scene";
import { MainMenuScene } from "./scenes/main-menu/main-menu.scene";
import { HudScene } from "./scenes/hud/hud.scene";
import { GameScene } from "./scenes/game/game.scene";
import { GameBoardScene } from "./scenes/game-board/game-board.scene";
import { NewGameBoardScene } from "./scenes/new-game-board/new-game-board.scene";
import { ChooseQuestionScene } from "./scenes/choose-question/choose-question.scene";
import { ReplyQuestionScene } from "./scenes/reply-question/reply-question.scene";
import { ClueCardScene } from "./scenes/clue-card/clue-card.scene";
import { PodiumScene } from "./scenes/podium/podium.scene";

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
    dom: {
      createContainer: true,
    },
    scene: [
      LoadingScene,
      MainMenuScene,
      HudScene,
      GameScene,
      GameBoardScene,
      NewGameBoardScene,
      ChooseQuestionScene,
      ReplyQuestionScene,
      ClueCardScene,
      PodiumScene,
    ],
    plugins: {
      scene: [
        {
          key: "rexUI",
          plugin: RexUIPlugin,
          mapping: "rexUI",
        },
      ],
      global: [{
        key: 'rexPerspectiveImagePlugin',
        plugin: PerspectiveImagePlugin,
        start: true
    }]
    },
    // @ts-expect-error Ignore this error because we're using a custom pipeline.
    pipeline: { CurvedPostFX },
    transparent: true,
  };

  new Phaser.Game(config);
});
