export function mapFormDataToQuestions(formData, allQuestions) {
  const result = [];
  for (const [code, score] of Object.entries(formData)) {
    for (const category of allQuestions) {
      const question = category.questions.find((q) => q.id === code);
      if (question) {
        result.push({
          code: code,
          question: question.text,
          score: score,
        });
        break;
      }
    }
  }
  return result;
}

export const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol.slice(0, -1);
    const host = window.location.host;

    return `${protocol}://${host}`;
  }

  return "https://luxuri.com";
};
