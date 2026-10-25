// ====== Turn the "under construction" notice off here once the site is ready for orders ======
export const SHOW_UNDER_CONSTRUCTION = true;

// shown once per visit (browser tab session); FeedbackWatcher waits for it too
export const SITE_NOTICE_KEY = "shyam_site_notice_seen";

const alreadySeen = () => {
  try {
    return Boolean(sessionStorage.getItem(SITE_NOTICE_KEY));
  } catch {
    return false;
  }
};

export const isSiteNoticePending = () => SHOW_UNDER_CONSTRUCTION && !alreadySeen();

export const markSiteNoticeSeen = () => {
  try {
    sessionStorage.setItem(SITE_NOTICE_KEY, "1");
  } catch {
    /* private mode: it may show again next page load */
  }
};
