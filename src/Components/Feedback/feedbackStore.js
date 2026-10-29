const DONE_KEY = "feedbackDone";
const SNOOZE_KEY = "feedbackSnoozedUntil";
const QUIET_KEY = "feedbackQuietUntil";
const DAY_MS = 24 * 60 * 60 * 1000;

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the pop-up may simply ask again */
  }
};

const startQuietPeriod = () => write(QUIET_KEY, Date.now() + DAY_MS);

// should this order's pop-up stay hidden right now?
export const isFeedbackSuppressed = (orderId) => {
  const now = Date.now();
  if (read(QUIET_KEY, 0) > now) return true;
  if (read(DONE_KEY, []).includes(orderId)) return true;
  return (read(SNOOZE_KEY, {})[orderId] || 0) > now;
};

export const markFeedbackDone = (orderId) => {
  const done = read(DONE_KEY, []);
  if (!done.includes(orderId)) write(DONE_KEY, [...done, orderId]);
  startQuietPeriod();
};

export const snoozeFeedback = (orderId) => {
  const now = Date.now();
  // drop expired snoozes so the stored list doesn't grow forever
  const snoozed = Object.fromEntries(Object.entries(read(SNOOZE_KEY, {})).filter(([, until]) => until > now));
  snoozed[orderId] = now + DAY_MS;
  write(SNOOZE_KEY, snoozed);
  startQuietPeriod();
};

// keys whose change in another tab should close an open pop-up here
export const FEEDBACK_STORAGE_KEYS = [DONE_KEY, SNOOZE_KEY, QUIET_KEY];
