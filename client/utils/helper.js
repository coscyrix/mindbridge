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

// SHARED FUNCTION
// export function convertUTCToLocalTime(utcTimeString) {
//   let dateString = utcTimeString;
//   // Check if the date string includes a time component
//   if (utcTimeString.includes(":")) {
//     dateString += " UTC"; // Append "UTC" if the time component is present
//   }
//   //
//   // Create a Date object from the date string
//   const date = new Date(dateString);
//   // Format the local time from the Date object
//   const options = {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false, // use 24-hour format; set to true for 12-hour format
//     timeZoneName: "short", // include time zone name
//   };
//   // If the date string doesn't include a time, remove the time components from the options
//   if (!utcTimeString.includes(":")) {
//     delete options.hour;
//     delete options.minute;
//     delete options.second;
//     delete options.timeZoneName;
//   }
//   // Format the local time
//   const localTimeString = new Intl.DateTimeFormat("default", options).format(
//     date
//   );
//   return localTimeString;
// }

// export function convertUTCToLocalTime(utcTimeString) {
//   console.log(utcTimeString, "utcTimeString1");
//   if (!utcTimeString) {
//     return { date: "NA", time: "NA" };
//   }
//   console.log(utcTimeString, "utcTimeString2");

//   let dateString = utcTimeString;
//   if (utcTimeString.includes(":")) {
//     dateString += " UTC";
//   }

//   const date = new Date(dateString);
//   const optionsDate = { year: "numeric", month: "short", day: "2-digit" };
//   const optionsTime = {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//     timeZoneName: "short",
//   };

//   const formattedDate = new Intl.DateTimeFormat("default", optionsDate).format(
//     date
//   );
//   let formattedTime = "";

//   if (utcTimeString.includes(":")) {
//     formattedTime = new Intl.DateTimeFormat("default", optionsTime).format(
//       date
//     );
//   }

//   return {
//     date: formattedDate,
//     time: formattedTime,
//   };
// }

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
  let formattedTime = new Intl.DateTimeFormat("default", optionsTime).format(
    date
  );

  if (!isOnlyTime) {
    formattedDate = new Intl.DateTimeFormat("default", optionsDate).format(
      date
    );
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
