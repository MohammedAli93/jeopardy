import { QuestionsModel, type Question } from "./models/questions.model";

export class GameCore {
  public static questions = new QuestionsModel();
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
