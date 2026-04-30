import { NewsDetailPage } from "@/components/pages/NewsDetailPage";

type NewsDetailRoutePageProps = {
  params: {
    slug: string;
  };
};

export default function NewsDetailRoutePage({ params }: NewsDetailRoutePageProps) {
  return <NewsDetailPage slug={params.slug} />;
}
