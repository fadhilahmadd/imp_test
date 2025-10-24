// frontend/app/create/page.tsx
import PostForm from "@/components/posts/PostForm"; //
import { createPostAction } from "@/lib/actions"; //

export default function CreatePostPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Create a New Post</h1>

      <div className="card w-full bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <PostForm action={createPostAction} /> {/* */}
        </div>
      </div>
    </div>
  );
}