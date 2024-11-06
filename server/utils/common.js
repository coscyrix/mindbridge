//utils/common.js

export const capitalizeFirstLetter = (sentence) => {
  return sentence
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const splitIsoDatetime = (isoDatetime) => {
  try {
    // Split the ISO datetime into date and time components
    const [date, time] = isoDatetime.split('T');

    // Return the components as an array
    return { date, time };
  } catch (error) {
    throw new Error(
      'Invalid ISO datetime format. Please provide a valid ISO 8601 format string.',
    );
  }
};
