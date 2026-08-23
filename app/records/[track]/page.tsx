import { notFound } from "next/navigation";
import { RecordsRoute } from "../../features/records/records-routes";
import { trackIds, type TrackId } from "../../lib/profile-model";

export default async function TrackRecordsPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!trackIds.includes(track as TrackId)) notFound();
  return <RecordsRoute track={track as TrackId} />;
}
