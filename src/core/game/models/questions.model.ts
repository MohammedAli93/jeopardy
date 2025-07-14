export class QuestionsModel {
  public data: Question[] = [];

  public setQuestions(questions: Question[]) {
    this.data = questions;
  }

  public get categoriesCount() {
    const set = new Set(this.data.map((q) => q.category));
    return set.size;
  }

  public get categories() {
    const set = new Set(this.data.map((q) => q.category));
    return Array.from(set);
  }

  public getQuestionsCountByCategory(category: string) {
    return this.data.filter((q) => q.category === category).length;
  }

  public getQuestionsMaxCount() {
    const set = new Set(this.data.map((q) => q.category));
    return Math.max(...Array.from(set).map((c) => this.getQuestionsCountByCategory(c)));
  }

  public getQuestionsByCategory(category: string) {
    return this.data.filter((q) => q.category === category);
  }

  public getQuestionByCategoryAndQuestion(category: string, question: string) {
    return this.data.find((q) => q.category === category && q.question === question);
  }
}

export interface Question {
  category: string;
  question: string;
  answer: string;
  price: number;
  winner?: string;
}
