import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

/**
 * Custom hook to check if the current time is between two specific time check
 * @param {string} timeCheck1 - The time to check if the current time is before
 * @param {string} timeCheck2 - The time to check if the current time is after
 * @param {string} granularity - The granularity of the check (https://day.js.org/docs/en/manipulate/start-of#list-of-all-available-units)
 * @returns {boolean} - true if the current time is between timeCheck1 and timeCheck2, false otherwise
 * @thanks to ChatGPT :-)
 */
function useTimeCheck(timeCheck1, timeCheck2, granularity = 'minutes') {
  // State to keep the current time updated
  const [now, setNow] = useState(dayjs());
  // State to keep the check result
  const [timeMatched, setTimeMatched] = useState(false);
  // State to keep the intervalId
  const [intervalId, setIntervalId] = useState(null);

  // Effect to set the interval and keep the current time updated
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    setIntervalId(interval);

    // cleanup function to clear the interval
    return () => clearInterval(intervalId);
  }, []);

  // Effect to check if the current time is between timeCheck1 and timeCheck2
  useEffect(() => {
    if (now.isAfter(timeCheck1.toISOString(), granularity) && now.isBefore(timeCheck2.toISOString(), granularity)) {
      setTimeMatched(true);
    } else {
      setTimeMatched(false);
    }
  }, [now, timeCheck1, timeCheck2]);

  useEffect(() => () => clearInterval(intervalId), [intervalId]);

  return timeMatched;
}

export default useTimeCheck;
