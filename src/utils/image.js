// Ask Cloudinary for a right-sized, modern-format copy of an image
// (WebP/AVIF, auto quality). A 540 KB product PNG comes back at ~40 KB.
// Non-Cloudinary URLs, videos and already-transformed URLs pass through untouched.
export const optimizeImage = (url, width = 600) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  const [base, rest] = url.split("/image/upload/");
  // an existing transformation segment (e.g. "w_300,c_fill/") means someone already chose one
  if (/^[a-z]{1,2}_[^/]*\//.test(rest)) return url;
  return `${base}/image/upload/f_auto,q_auto,w_${width},c_limit/${rest}`;
};
