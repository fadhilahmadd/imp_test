import { getAuthenticatedUser } from "@/lib/auth.server";
import { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeletePostForm from "@/components/posts/DeletePostForm"; // Import new component

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, user] = await Promise.all([getPost(id), getAuthenticatedUser()]);

  if (!post) {
    notFound();
  }

  const isAuthor = user && user.id === post.author?.id;

  return (
    <article className="max-w-4xl mx-auto">
      {isAuthor && (
        <div className="flex justify-end gap-2 mb-4 p-4 bg-base-200 rounded-lg">
          <Link
            href={`/posts/${post.id}/edit`}
            className="btn btn-outline btn-warning"
          >
            Edit
          </Link>
          <DeletePostForm postId={post.id} />
        </div>
      )}
      <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
      <div className="text-base-content text-opacity-70 mb-8">
        By {post.author?.name || "Unknown"} on {formatDate(post.createdAt)}
      </div>
      <div
        className="prose lg:prose-xl max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content.replace(/\n/g, "<br />"),
        }}
      />
    </article>
  );
}
