import { notFound } from "next/navigation";
import { topics } from "@/data/topics";
import TopicEditorialTable from "@/components/sections/TopicEditorialTable";

type TopicEditorialPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export async function generateStaticParams() {
  return topics.map((topic) => ({
    topicId: topic.id,
  }));
}

export default async function TopicEditorialPage({
  params,
}: TopicEditorialPageProps) {
  const { topicId } = await params;

  const topicExists = topics.some((topic) => topic.id === topicId);

  if (!topicExists) {
    notFound();
  }

  return <TopicEditorialTable topicId={topicId} />;
}