import { ArticleForm } from "../_components/article-form";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticleForm articleId={id} isViewMode={true} />;
}
