export class QuestionsModel {
  public data: Question[] = [];

  public setQuestions(questions: Question[]) {
    this.data = questions;
  }

  public get categoriesCount() {
    // Only count categories for regular questions, exclude Final Jeopardy
    const regularQuestions = this.data.filter((q) => !q.isFinalJeopardy);
    const set = new Set(regularQuestions.map((q) => q.category));
    return set.size;
  }

  public get categories() {
    // Only return categories for regular questions, exclude Final Jeopardy
    const regularQuestions = this.data.filter((q) => !q.isFinalJeopardy);
    const set = new Set(regularQuestions.map((q) => q.category));
    return Array.from(set);
  }

  public getQuestionsCountByCategory(category: string) {
    // Only count regular questions for this category, exclude Final Jeopardy
    return this.data.filter((q) => q.category === category && !q.isFinalJeopardy).length;
  }

  public getQuestionsMaxCount() {
    // Only consider regular questions, exclude Final Jeopardy
    const regularQuestions = this.data.filter((q) => !q.isFinalJeopardy);
    const set = new Set(regularQuestions.map((q) => q.category));
    return Math.max(...Array.from(set).map((c) => this.getQuestionsCountByCategory(c)));
  }

  public getQuestionsByCategory(category: string) {
    // Only return regular questions for this category, exclude Final Jeopardy
    return this.data.filter((q) => q.category === category && !q.isFinalJeopardy);
  }

  public getQuestionByCategoryAndQuestion(category: string, question: string) {
    // Only find regular questions, exclude Final Jeopardy
    return this.data.find((q) => q.category === category && q.question === question && !q.isFinalJeopardy);
  }

  public getFinalJeopardyQuestions() {
    return this.data.filter((q) => q.isFinalJeopardy === true);
  }

  public getRandomFinalJeopardyQuestion() {
    const finalQuestions = this.getFinalJeopardyQuestions();
    if (finalQuestions.length === 0) return null;
    return finalQuestions[Math.floor(Math.random() * finalQuestions.length)];
  }

  public getFinalJeopardyCategories() {
    const finalQuestions = this.data.filter((q) => q.isFinalJeopardy === true);
    const set = new Set(finalQuestions.map((q) => q.category));
    return Array.from(set);
  }

  public getRegularQuestions() {
    return this.data.filter((q) => !q.isFinalJeopardy);
  }
}

export interface Question {
  category: string;
  question: string;
  answer: string;
  price: number;
  winner?: string;
  isFinalJeopardy?: boolean;
}
