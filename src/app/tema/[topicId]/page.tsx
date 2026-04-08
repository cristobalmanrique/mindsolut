import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { topics } from "@/data/topics";
import { getPublicAssetsByTopic } from "@/lib/seo/publicIndex";

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export async function generateStaticParams() {
  return topics.map((topic) => ({
    topicId: topic.id,
  }));
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { topicId } = await params;
  const topic = topics.find((item) => item.id === topicId);

  if (!topic) return {};

  return {
    title: `${topic.title} | Fichas educativas | Mindsolut`,
    description:
      topic.description || `Explora las fichas educativas del topic ${topic.title}.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;

  const topic = topics.find((item) => item.id === topicId);
  const assets = getPublicAssetsByTopic(topicId);

  if (!topic || assets.length === 0) {
    notFound();
  }

  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
          >
            ← Volver a topics
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {topic.title}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {topic.description}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <Link href={`/recurso/${asset.slug}`}>
                <div className="relative aspect-[3/4] bg-slate-100">
                  <Image
                    src={asset.previewImage}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  <Link href={`/recurso/${asset.slug}`}>
                    {asset.title}
                  </Link>
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {asset.description}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/recurso/${asset.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                  >
                    Ver ficha →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
