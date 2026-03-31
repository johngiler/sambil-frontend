import SpaceDetailView from "@/views/SpaceDetailView";

export default async function CatalogDetailPage({ params }) {
  const { id } = await params;
  return <SpaceDetailView spaceId={id} />;
}
