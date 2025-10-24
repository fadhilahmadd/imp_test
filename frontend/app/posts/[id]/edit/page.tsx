import PostForm from "@/components/posts/PostForm";
import { updatePostAction } from "@/lib/actions";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { Post } from "@/lib/types";
import { notFound, redirect } from "next/navigation";

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
    return null;
  }
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, user] = await Promise.all([getPost(id), getAuthenticatedUser()]);

  if (!post) {
    notFound();
  }

  if (!user || user.id !== post.author?.id) {
    redirect(`/posts/${id}`);
  }

  const updateActionWithId = updatePostAction.bind(null, post.id);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Edit Post</h1>
      <PostForm post={post} action={updateActionWithId} />
    </div>
  );
}
