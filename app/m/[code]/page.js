import MallSpacesView from "@/views/MallSpacesView";

export default async function MallSpacesPage({ params }) {
  const { code } = await params;
  return <MallSpacesView centerCode={code} />;
}
