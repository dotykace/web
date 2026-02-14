import ChapterClient from "./ChapterClient"

export async function generateStaticParams() {
  // Generate static params for all available chapters
  return [{ id: "0" }, { id: "1" }, {id: "2" }, { id: "4" }]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Chapter({ params }: PageProps) {
  const { id } = await params
  return <ChapterClient id={id} />
}
