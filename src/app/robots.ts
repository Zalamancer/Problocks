import type { MetadataRoute } from "next";

const BASE_URL = "https://playdemy.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/studio",
          "/studio/",
          "/build",
          "/build/",
          "/teacher",
          "/teacher/",
          "/teach",
          "/teach/",
          "/student",
          "/student/",
          "/play",
          "/play/",
          "/join",
          "/join/",
          "/homework",
          "/homework/",
          "/classroom/auth",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
