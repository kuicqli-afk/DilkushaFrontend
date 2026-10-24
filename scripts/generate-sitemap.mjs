// Writes public/sitemap.xml before every build (npm "prebuild").
// Pulls the live category list so each visible category page is listed;
// if the API is unreachable the static pages are still written.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://shyamnamkeenandbakers.online";
const API_URL = "https://backend.shyamnamkeenandbakers.online/api/category/categories";
const OUT = fileURLToPath(new URL("../public/sitemap.xml", import.meta.url));

const STATIC_PATHS = [
  ["/", "1.0", "daily"],
  ["/category/all", "0.9", "daily"],
  ["/all-offers", "0.8", "daily"],
  ["/weekend-specials", "0.6", "weekly"],
  ["/about-us", "0.7", "monthly"],
  ["/contact-us", "0.6", "monthly"],
  ["/shipping-and-delivery", "0.5", "monthly"],
  ["/become-a-rider", "0.4", "monthly"],
  ["/terms-and-conditions", "0.3", "yearly"],
  ["/privacy-policy", "0.3", "yearly"],
];

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const fetchCategoryPaths = async () => {
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json.categories || json.data || [];
    return list
      .filter((c) => !c.hidden && (c.name || c.title))
      .map((c) => [`/category/${encodeURIComponent(c.name || c.title)}`, "0.8", "daily"]);
  } catch (err) {
    console.warn(`sitemap: category fetch failed (${err.message}); writing static pages only`);
    return [];
  }
};

const categoryPaths = await fetchCategoryPaths();
const today = new Date().toISOString().slice(0, 10);

const urls = [...STATIC_PATHS, ...categoryPaths]
  .map(
    ([path, priority, changefreq]) =>
      `  <url>\n    <loc>${escapeXml(SITE_URL + path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join("\n");

writeFileSync(
  OUT,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`sitemap: wrote ${STATIC_PATHS.length + categoryPaths.length} URLs`);
