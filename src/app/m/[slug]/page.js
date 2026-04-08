import MallSpacesView from "@/views/MallSpacesView";

export default async function MallSpacesPage({ params }) {
  const { slug } = await params;
  return <MallSpacesView centerSlug={slug} />;
}
