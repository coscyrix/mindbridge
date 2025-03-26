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

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function convertUTCToLocalTime(utcTimeString) {
  let isOnlyTime = false;
  let dateString = utcTimeString;

  // Check if input is only a time with "Z" (UTC time)
  if (/^\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(utcTimeString)) {
    isOnlyTime = true;
    // Append today's UTC date to the time string
    const todayUTC = new Date().toISOString().split("T")[0]; // YYYY-MM-DD in UTC
    dateString = `${todayUTC}T${utcTimeString}`; // Full UTC datetime
  }

  const date = new Date(dateString);

  const optionsDate = { year: "numeric", month: "short", day: "2-digit" };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hour12: true,
    // timeZoneName: "short",
  };

  let formattedDate = "";
  let formattedTime = new Intl.DateTimeFormat("en-UK", optionsTime).format(
    date
  );

  if (!isOnlyTime) {
    formattedDate = new Intl.DateTimeFormat("en-UK", optionsDate).format(date);
  }

  return {
    date: isOnlyTime ? "" : formattedDate,
    time: formattedTime,
  };
}

export function convertLocalToUTCTime(req_dte, req_time) {
  const localDate = new Date(`${req_dte}T${req_time}:00`);

  const utcDateTime = localDate.toISOString();

  return utcDateTime;
}
