import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { tumTerimler } from "@/lib/terms";

export default function sitemap(): MetadataRoute.Sitemap {
  const terimler = tumTerimler();

  return [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/sozluk`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/gundem`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/calis`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/doviz`, changeFrequency: "monthly", priority: 0.6 },
    ...terimler.map((t) => ({
      url: `${SITE.url}/sozluk/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
