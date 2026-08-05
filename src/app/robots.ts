import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Everything here is meant to be found. The only path worth keeping out of an
 * index is the presence endpoint, which is data for the page rather than a page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
