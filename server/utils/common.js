//utils/common.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import logger from '../config/winston.js';
const moment = require('moment-timezone');;

export const capitalizeFirstLetter = (sentence) => {
  return sentence
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const capitalizeFirstLetterOfEachWord = (sentence) => {
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
    logger.error(
      'Invalid ISO datetime format. Please provide a valid ISO 8601 format string.',
    );
    return {
      message:
        'Invalid ISO datetime format. Please provide a valid ISO 8601 format string.',
      error: -1,
    };
  }
};

export const convertTimeToReadableFormat = (data) => {
  try {
    const timeString = moment(data.dateTimeString)
      .tz(data.timeZone)
      .format('h:mm A z');
    const dateString = moment(data.dateTimeString).format('MMMM Do, YYYY');
    return { timeString, dateString };
  } catch (error) {
    console.log(error);
    logger.error('Invalid time format. Please provide a valid time string.');
    return {
      message: 'Invalid time format. Please provide a valid time string.',
      error: -1,
    };
  }
};
