import { QuestionsModel, type Question } from "./models/questions.model";

export class GameCore {
  public static questions = new QuestionsModel();
}

// Testing purposes
// if (import.meta.env.DEV) {
  const questions: Question[] = [
    // CAPITALS
    {
      category: "CAPITALS",
      question: "What is the capital of France?",
      answer: "Paris",
      price: 400,
    },
    {
      category: "CAPITALS",
      question: "What is the capital of Spain?",
      answer: "Madrid",
      price: 800
    },
    {
      category: "CAPITALS",
      question: "What is the capital of Germany?",
      answer: "Berlin",
      price: 1200,
    },
    {
      category: "CAPITALS",
      question: "What is the capital of Italy?",
      answer: "Rome",
      price: 1600,
    },
    {
      category: "CAPITALS",
      question: "What is the capital of the United States?",
      answer: "Washington, D.C.",
      price: 2000,
    },

    // SPORTS
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Argentina?",
      answer: "Lionel Messi",
      price: 400,
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Brazil?",
      answer: "Ronaldo",
      price: 800
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Portugal?",
      answer: "Cristiano Ronaldo",
      price: 1200,
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the Spain?",
      answer: "Raul Gonzalez",
      price: 1600,
    },
    {
      category: "SPORTS",
      question: "What is the name of the most popular player in the France?",
      answer: "Kylian Mbappe",
      price: 2000,
    },

    // CINEMA/TV
    {
      category: "CINEMA/TV",
      question: "What is the name of a serie about a man with cancer and make drugs?",
      answer: "Breaking Bad",
      price: 400,
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a movie about a man can fly, shoot laser beams with his eyes and is stronger than a human?",
      answer: "Superman",
      price: 800
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a TV show about a man with a superpower to run at super speed?",
      answer: "The Flash",
      price: 1200,
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a movie about a ship diving in the ocean?",
      answer: "Titanic",
      price: 1600,
    },
    {
      category: "CINEMA/TV",
      question: "What is the name of a serie about a girl playing chess?",
      answer: "Queen Gambit",
      price: 2000,
    },

    // COLORS
    {
      category: "COLORS",
      question: "What is the color of the sky?",
      answer: "Blue",
      price: 400,
    },
    {
      category: "COLORS",
      question: "What is the color of the sun?",
      answer: "Yellow",
      price: 800
    },
    {
      category: "COLORS",
      question: "What color you get when you mix red and yellow?",
      answer: "Orange",
      price: 1200,
    },
    {
      category: "COLORS",
      question: "What color you get when you mix blue and red?",
      answer: "Purple",
      price: 1600,
    },
    {
      category: "COLORS",
      question: "What color you get when you mix yellow and blue?",
      answer: "Green",
      price: 2000,
    },

    // ANIMALS
    {
      category: "ANIMALS",
      question: "What is the name of the most popular animal in the world?",
      answer: "Dog",
      price: 400,
    },
    {
      category: "ANIMALS",
      question: "What is the name of the most popular animal in the world?",
      answer: "Dog",
      price: 800
    },
    {
      category: "ANIMALS",
      question: "What is the name of the most popular animal in the world?",
      answer: "Dog",
      price: 1200,
    },
    {
      category: "ANIMALS",
      question: "What is the name of the most popular animal in the world?",
      answer: "Dog",
      price: 1600,
    },
    {
      category: "ANIMALS",
      question: "What is the name of the most popular animal in the world?",
      answer: "Dog",
      price: 2000,
    },

    // FOOD
    {
      category: "FOOD",
      question: "What is the name of the most popular food in the world?",
      answer: "Pizza",
      price: 400,
    },
    {
      category: "FOOD",
      question: "What is the name of the most popular food in the world?",
      answer: "Pizza",
      price: 800
    },
    {
      category: "FOOD",
      question: "What is the name of the most popular food in the world?",
      answer: "Pizza",
      price: 1200,
    },
    {
      category: "FOOD",
      question: "What is the name of the most popular food in the world?",
      answer: "Pizza",
      price: 1600,
    },
    {
      category: "FOOD",
      question: "What is the name of the most popular food in the world?",
      answer: "Pizza",
      price: 2000,
    }
  ];

  GameCore.questions.setQuestions(questions);
// }
