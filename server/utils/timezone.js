// utils/timezone.js

/**
 * @note We might not be using this util anymore
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');

dotenv.config();

// Timezone mapping from country calling codes to IANA timezones
const countryCodeToTimezone = {
  '355': 'Europe/Tirane', // Albania
  '376': 'Europe/Andorra', // Andorra
  '54': 'America/Argentina/Buenos_Aires', // Argentina
  '374': 'Asia/Yerevan', // Armenia
  '61': 'Australia/Sydney', // Australia
  '43': 'Europe/Vienna', // Austria
  '994': 'Asia/Baku', // Azerbaijan
  '880': 'Asia/Dhaka', // Bangladesh
  '375': 'Europe/Minsk', // Belarus
  '32': 'Europe/Brussels', // Belgium
  '501': 'America/Belize', // Belize
  '591': 'America/La_Paz', // Bolivia
  '387': 'Europe/Sarajevo', // Bosnia and Herzegovina
  '55': 'America/Sao_Paulo', // Brazil
  '673': 'Asia/Brunei', // Brunei
  '359': 'Europe/Sofia', // Bulgaria
  '855': 'Asia/Phnom_Penh', // Cambodia
  '1': 'America/New_York', // Canada/United States
  '56': 'America/Santiago', // Chile
  '86': 'Asia/Shanghai', // China
  '57': 'America/Bogota', // Colombia
  '682': 'Pacific/Rarotonga', // Cook Islands
  '506': 'America/Costa_Rica', // Costa Rica
  '385': 'Europe/Zagreb', // Croatia
  '53': 'America/Havana', // Cuba
  '357': 'Asia/Nicosia', // Cyprus
  '420': 'Europe/Prague', // Czech Republic
  '45': 'Europe/Copenhagen', // Denmark
  '670': 'Asia/Dili', // East Timor
  '593': 'America/Guayaquil', // Ecuador
  '503': 'America/El_Salvador', // El Salvador
  '372': 'Europe/Tallinn', // Estonia
  '500': 'Atlantic/Stanley', // Falkland Islands
  '691': 'Pacific/Pohnpei', // Federated States of Micronesia
  '679': 'Pacific/Fiji', // Fiji
  '358': 'Europe/Helsinki', // Finland
  '33': 'Europe/Paris', // France
  '594': 'America/Cayenne', // French Guiana
  '689': 'Pacific/Tahiti', // French Polynesia
  '995': 'Asia/Tbilisi', // Georgia
  '49': 'Europe/Berlin', // Germany
  '350': 'Europe/Gibraltar', // Gibraltar
  '30': 'Europe/Athens', // Greece
  '590': 'America/Guadeloupe', // Guadeloupe
  '502': 'America/Guatemala', // Guatemala
  '592': 'America/Guyana', // Guyana
  '509': 'America/Port-au-Prince', // Haiti
  '504': 'America/Tegucigalpa', // Honduras
  '852': 'Asia/Hong_Kong', // Hong Kong
  '36': 'Europe/Budapest', // Hungary
  '354': 'Atlantic/Reykjavik', // Iceland
  '91': 'Asia/Kolkata', // India
  '62': 'Asia/Jakarta', // Indonesia
  '353': 'Europe/Dublin', // Ireland
  '39': 'Europe/Rome', // Italy
  '81': 'Asia/Tokyo', // Japan
  '686': 'Pacific/Tarawa', // Kiribati
  '383': 'Europe/Belgrade', // Kosovo
  '856': 'Asia/Vientiane', // Laos
  '371': 'Europe/Riga', // Latvia
  '423': 'Europe/Vaduz', // Liechtenstein
  '370': 'Europe/Vilnius', // Lithuania
  '352': 'Europe/Luxembourg', // Luxembourg
  '853': 'Asia/Macau', // Macau
  '389': 'Europe/Skopje', // Macedonia
  '60': 'Asia/Kuala_Lumpur', // Malaysia
  '356': 'Europe/Malta', // Malta
  '692': 'Pacific/Majuro', // Marshall Islands
  '596': 'America/Martinique', // Martinique
  '52': 'America/Mexico_City', // Mexico
  '373': 'Europe/Chisinau', // Moldova
  '377': 'Europe/Monaco', // Monaco
  '382': 'Europe/Podgorica', // Montenegro
  '674': 'Pacific/Nauru', // Nauru
  '31': 'Europe/Amsterdam', // Netherlands
  '599': 'America/Aruba', // Netherlands Antilles
  '687': 'Pacific/Noumea', // New Caledonia
  '64': 'Pacific/Auckland', // New Zealand
  '505': 'America/Managua', // Nicaragua
  '683': 'Pacific/Niue', // Niue
  '850': 'Asia/Pyongyang', // North Korea
  '47': 'Europe/Oslo', // Norway
  '680': 'Pacific/Palau', // Palau
  '507': 'America/Panama', // Panama
  '675': 'Pacific/Port_Moresby', // Papua New Guinea
  '595': 'America/Asuncion', // Paraguay
  '51': 'America/Lima', // Peru
  '63': 'Asia/Manila', // Philippines
  '48': 'Europe/Warsaw', // Poland
  '351': 'Europe/Lisbon', // Portugal
  '40': 'Europe/Bucharest', // Romania
  '7': 'Europe/Moscow', // Russian Federation
  '508': 'America/Miquelon', // Saint-Pierre and Miquelon
  '685': 'Pacific/Apia', // Samoa
  '378': 'Europe/San_Marino', // San Marino
  '381': 'Europe/Belgrade', // Serbia
  '65': 'Asia/Singapore', // Singapore
  '421': 'Europe/Bratislava', // Slovakia
  '386': 'Europe/Ljubljana', // Slovenia
  '677': 'Pacific/Guadalcanal', // Solomon Islands
  '82': 'Asia/Seoul', // South Korea
  '34': 'Europe/Madrid', // Spain
  '597': 'America/Paramaribo', // Suriname
  '46': 'Europe/Stockholm', // Sweden
  '41': 'Europe/Zurich', // Switzerland
  '886': 'Asia/Taipei', // Taiwan
  '66': 'Asia/Bangkok', // Thailand
  '690': 'Pacific/Fakaofo', // Tokelau
  '676': 'Pacific/Tongatapu', // Tonga
  '90': 'Europe/Istanbul', // Turkey
  '688': 'Pacific/Funafuti', // Tuvalu
  '380': 'Europe/Kiev', // Ukraine
  '44': 'Europe/London', // United Kingdom
  '598': 'America/Montevideo', // Uruguay
  '678': 'Pacific/Efate', // Vanuatu
  '379': 'Europe/Vatican', // Vatican City
  '58': 'America/Caracas', // Venezuela
  '84': 'Asia/Ho_Chi_Minh', // Vietnam
  '681': 'Pacific/Wallis', // Wallis and Futuna
};

// Map common timezone abbreviations to IANA timezones
const timezoneAbbreviationMap = {
  'CST': 'America/Chicago', // Central Standard Time
  'CDT': 'America/Chicago', // Central Daylight Time
  'EST': 'America/New_York', // Eastern Standard Time
  'EDT': 'America/New_York', // Eastern Daylight Time
  'PST': 'America/Los_Angeles', // Pacific Standard Time
  'PDT': 'America/Los_Angeles', // Pacific Daylight Time
  'MST': 'America/Denver', // Mountain Standard Time
  'MDT': 'America/Denver', // Mountain Daylight Time
  'AKST': 'America/Anchorage', // Alaska Standard Time
  'AKDT': 'America/Anchorage', // Alaska Daylight Time
  'HST': 'Pacific/Honolulu', // Hawaii Standard Time
  'HDT': 'Pacific/Honolulu', // Hawaii Daylight Time
};

/**
 * Normalize country code (remove +, handle strings/numbers)
 * @param {string|number|null|undefined} code - The country code to normalize
 * @returns {string|null} - Normalized country code or null if invalid
 */
export const normalizeCountryCode = (code) => {
  if (code === undefined || code === null) {
    return null;
  }

  if (typeof code === 'number') {
    return String(code);
  }

  if (typeof code === 'string') {
    const trimmed = code.trim();
    if (!trimmed) {
      return null;
    }
    // Remove leading + if present
    return trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
  }

  return null;
};

/**
 * Get timezone from country code
 * @param {string|number|null|undefined} countryCode - The country calling code
 * @returns {string|null} - IANA timezone identifier or null if not found
 */
export const getTimezoneByCountryCode = (countryCode) => {
  const normalizedCode = normalizeCountryCode(countryCode);
  if (!normalizedCode) {
    return null;
  }

  return countryCodeToTimezone[normalizedCode] || null;
};

/**
 * Validate and normalize timezone configuration
 * @param {string} tz - Timezone string (abbreviation or IANA identifier)
 * @returns {string|null} - Valid IANA timezone identifier or null if invalid
 */
export const validateTimezone = (tz) => {
  if (!tz) {
    return null;
  }

  // Check if it's a common abbreviation
  const upperTz = tz.toUpperCase();
  if (timezoneAbbreviationMap[upperTz]) {
    return timezoneAbbreviationMap[upperTz];
  }

  // Try to validate if it's a valid IANA timezone
  try {
    const testDate = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
    }).format(testDate);
    // If formatting succeeds, it's likely a valid timezone
    return tz;
  } catch (error) {
    console.warn(`Invalid timezone: ${tz}, error: ${error.message}`);
    return null;
  }
};

/**
 * Get friendly timezone display name
 * @param {string} tz - IANA timezone identifier
 * @returns {string} - Friendly timezone display name
 */
export const getFriendlyTimezoneName = (tz) => {
  if (!tz) {
    return getDefaultTimezoneDisplayName();
  }

  try {
    const formattedParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longGeneric',
    }).formatToParts(new Date());

    const timeZoneNamePart = formattedParts.find(
      (part) => part.type === 'timeZoneName',
    );

    if (timeZoneNamePart?.value) {
      const friendlyName = tz.replace(/_/g, ' ');
      return `${timeZoneNamePart.value} (${friendlyName})`;
    }

    return tz.replace(/_/g, ' ');
  } catch (error) {
    console.warn('Unable to format timezone name', { tz, error: error.message });
    return tz.replace(/_/g, ' ');
  }
};

/**
 * Derive timezone from country codes (prefer client, fallback to counselor, then default)
 * @param {string|number|null|undefined} clientCountryCode - Client's country code
 * @param {string|number|null|undefined} counselorCountryCode - Counselor's country code
 * @param {string} defaultTimezone - Default timezone to use if country codes don't match
 * @returns {string} - IANA timezone identifier
 */
export const deriveTimezoneFromCountryCodes = (
  clientCountryCode,
  counselorCountryCode,
  defaultTimezone = null,
) => {
  // Try client country code first
  if (clientCountryCode) {
    const clientTimezone = getTimezoneByCountryCode(clientCountryCode);
    if (clientTimezone) {
      console.log(
        `Using timezone from client country code: ${clientCountryCode} -> ${clientTimezone}`,
      );
      return clientTimezone;
    }
  }

  // Fallback to counselor country code
  if (counselorCountryCode) {
    const counselorTimezone = getTimezoneByCountryCode(counselorCountryCode);
    if (counselorTimezone) {
      console.log(
        `Using timezone from counselor country code: ${counselorCountryCode} -> ${counselorTimezone}`,
      );
      return counselorTimezone;
    }
  }

  // Fallback to default timezone or configured default
  const fallbackTz = defaultTimezone || getDefaultTimezone();
  console.log(`Using default configured timezone: ${fallbackTz}`);
  return fallbackTz;
};

/**
 * Format date and time in a specific timezone
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:mm:ss or HH:mm)
 * @param {string} timezone - IANA timezone identifier
 * @returns {{localDate: string, localTime: string}} - Formatted date and time
 */
export const formatDateTimeInTimezone = (dateString, timeString, timezone) => {
  if (!dateString || !timeString) {
    return { localDate: 'N/A', localTime: 'N/A' };
  }

  try {
    // Combine date and time into one ISO datetime string
    const dateTimeString = `${dateString}T${timeString}`;
    const localDateTime = new Date(dateTimeString);

    // Check if the date is valid
    if (isNaN(localDateTime.getTime())) {
      console.warn(`Invalid date created from: "${dateTimeString}"`);
      return { localDate: 'N/A', localTime: 'N/A' };
    }

    // Convert the full datetime to the desired timezone for both date and time
    let localDate, localTime;

    try {
      localDate = localDateTime.toLocaleDateString('en-US', {
        timeZone: timezone,
      });
      localTime = localDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
      });
    } catch (tzError) {
      console.error(
        `Error formatting with timezone ${timezone}, falling back to default:`,
        tzError,
      );
      // Fallback to default timezone if derived timezone fails
      const defaultTz = getDefaultTimezone();
      localDate = localDateTime.toLocaleDateString('en-US', {
        timeZone: defaultTz,
      });
      localTime = localDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: defaultTz,
      });
    }

    return { localDate, localTime };
  } catch (error) {
    console.error('Error parsing date/time:', error);
    return { localDate: 'N/A', localTime: 'N/A' };
  }
};

// Default timezone configuration
const DEFAULT_TIME_ZONE = 'America/New_York';
const rawTimeZoneConfig = process.env.TIMEZONE || DEFAULT_TIME_ZONE;
const timeZoneConfig = validateTimezone(rawTimeZoneConfig) || DEFAULT_TIME_ZONE;
const timeZoneFriendlyName = timeZoneConfig.replace(/_/g, ' ');
let timeZoneDisplayName = timeZoneFriendlyName;

try {
  const formattedParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneConfig,
    timeZoneName: 'longGeneric',
  }).formatToParts(new Date());

  const timeZoneNamePart = formattedParts.find(
    (part) => part.type === 'timeZoneName',
  );

  if (timeZoneNamePart?.value) {
    timeZoneDisplayName = `${timeZoneNamePart.value} (${timeZoneFriendlyName})`;
  }
} catch (error) {
  console.warn(
    'Unable to derive friendly timezone name. Falling back to config value.',
    {
      timeZoneConfig,
      error: error.message,
    },
  );
}

/**
 * Get the default timezone from configuration
 * @returns {string} - Default IANA timezone identifier
 */
export const getDefaultTimezone = () => {
  return timeZoneConfig;
};

/**
 * Get the default timezone display name
 * @returns {string} - Default timezone display name
 */
export const getDefaultTimezoneDisplayName = () => {
  return timeZoneDisplayName;
};

/**
 * Get all available country codes
 * @returns {string[]} - Array of country codes
 */
export const getAvailableCountryCodes = () => {
  return Object.keys(countryCodeToTimezone);
};

/**
 * Get timezone for a specific country code
 * @param {string} countryCode - Country calling code
 * @returns {string|null} - IANA timezone identifier or null if not found
 */
export const getTimezoneForCountry = (countryCode) => {
  return getTimezoneByCountryCode(countryCode);
};
