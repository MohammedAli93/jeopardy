## 🎯 Jeopardy – Phaser 3 + Vite

This is a Jeopardy-style trivia game implemented with Phaser 3, using Vite for bundling and modern ES modules for clean development.

## Features

Customizable categories and questions via JSON.

Fully animated board reveal and selection.

Question and answer scenes with smooth transitions.

Score tracking for multiple players or teams.

Keyboard, mouse, and touch support.

## Versions

Phaser 3.90.0

Vite 6.3.1

TypeScript 5.7.2 (if applicable)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm install`   | Install project dependencies                   |
| `npm run dev`   | Launch a development web server                |
| `npm run build` | Create a production build in the `dist` folder |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:3000` by default. Please see the Vite documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## Project Structure

We have provided a default project structure to get you started. This is as follows:

| Path                     | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `index.html`             | A basic HTML page to contain the game.                                  |
| `src`                    | Contains the client source code.                                        |
| `src/main.ts`            | The main **Game** entry point.                                          |
| `src/components/`        | Contains all components used by all scenes.                             |
| `src/core/`              | Contains the core game logic, like state management and models.         |
| `src/game/pipelines/`    | Contains the pipelines used by the game (shaders).                      |
| `src/game/scenes/`       | The folder where Phaser Scenes are located.                             |
| `src/game/utils/`        | Contains utility functions used by the game (helpers).                  |
| `src/vite-env.d.ts`      | Global TypeScript declarations, providing type information.             |
| `src/style.css`          | Some simple CSS rules to help with page layout.                         |
| `public/assets`          | Contains the static assets used by the game.                            |
| `public/fonts`           | Contains the static fonts used by the game.                             |

## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from "./assets/logo.png";
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload();
{
  //  This is an example of an imported bundled image.
  //  Remember to import it at the top of this file
  this.load.image("logo", logoImg);

  //  This is an example of loading a static image
  //  from the public/assets folder:
  this.load.image("background", "assets/bg.png");
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload _all_ of the contents of the `dist` folder to a public facing web server.
