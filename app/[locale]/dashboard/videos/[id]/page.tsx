import { VideoForm } from "../_components/video-form";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VideoForm videoId={id} isViewMode={true} />;
}
