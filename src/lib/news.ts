import aspirationalHealthImage from "@/assets/aspirational-health.jpg";
import heroCollabImage from "@/assets/hero-collab.jpg";
import portfolioTeamImage from "@/assets/portfolio-team.jpg";

export type NewsItem = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCharCode(Number(num)));
}

export function htmlToPlainText(value: string): string {
  return decodeHtmlEntities(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export const seedItems: NewsItem[] = [
  {
    _id: "news-1",
    slug: "asvf-closes-120m-fund-iii",
    title: "ASVF closes $120M Fund III",
    excerpt: "Continuing our long-term commitment to category-defining founders.",
    content:
      "ASVF has successfully closed Fund III at $120M to support category-defining founders building enduring businesses. The fund reflects strong conviction in long-term value creation and operational partnership. We will continue to work closely with teams across early and growth stages, focusing on product depth, distribution velocity, and disciplined execution.",
    date: "2026-04-28T00:00:00.000Z",
    image: aspirationalHealthImage.src,
  },
  {
    _id: "news-2",
    slug: "novaiq-raises-series-b-led-by-asvf",
    title: "NovaIQ raises Series B led by ASVF",
    excerpt: "Doubling down on applied AI for the enterprise.",
    content:
      "NovaIQ announced its Series B round led by ASVF. The company is building practical AI tooling for enterprise teams where measurable outcomes matter. This investment aligns with our thesis around real-world AI adoption and scalable workflow automation.",
    date: "2026-04-28T00:00:00.000Z",
    image: heroCollabImage.src,
  },
  {
    _id: "news-3",
    slug: "welcoming-sara-kapoor-as-head-of-platform",
    title: "Welcoming Sara Kapoor as Head of Platform",
    excerpt: "Strengthening operating support across the portfolio.",
    content:
      "We are excited to welcome Sara Kapoor as Head of Platform. Sara brings deep experience in talent, go-to-market enablement, and founder support. Her role will expand hands-on operating help across our portfolio companies as they scale.",
    date: "2026-04-28T00:00:00.000Z",
    image: portfolioTeamImage.src,
  },
];

type ApiNewsItem = {
  _id?: unknown;
  title?: unknown;
  content?: unknown;
  date?: unknown;
  image?: unknown;
  slug?: unknown;
};

function mapApiItems(items: ApiNewsItem[]): NewsItem[] {
  return items.map((n, index) => {
    const id = typeof n?._id === "string" ? n._id : String(n?._id ?? index);
    const title = typeof n?.title === "string" && n.title.trim() ? n.title.trim() : "Untitled";
    const content = typeof n?.content === "string" && n.content.trim() ? n.content.trim() : title;
    const plainText = htmlToPlainText(content);
    const excerpt = plainText.length > 160 ? `${plainText.slice(0, 160)}...` : plainText;

    let dateValue: Date | null = null;
    if (typeof n?.date === "string" || typeof n?.date === "number") {
      const parsed = new Date(n.date);
      if (!Number.isNaN(parsed.getTime())) dateValue = parsed;
    }
    const date = dateValue ? dateValue.toISOString() : new Date().toISOString();

    const image = typeof n?.image === "string" ? n.image : "";
    const providedSlug = typeof n?.slug === "string" ? n.slug.trim() : "";
    const slug = providedSlug || slugify(title) || id;

    return {
      _id: id,
      slug,
      title,
      excerpt,
      content,
      date,
      image,
    };
  });
}

export async function fetchNewsItems(): Promise<NewsItem[]> {
  try {
    const res = await fetch("/api/news", { cache: "no-store" });
    const json = (await res.json()) as { data?: unknown };
    const apiData = json?.data;

    if (!Array.isArray(apiData) || apiData.length === 0) {
      return seedItems;
    }

    const mapped = mapApiItems(apiData as ApiNewsItem[]);
    return mapped.length > 0 ? mapped : seedItems;
  } catch {
    return seedItems;
  }
}
