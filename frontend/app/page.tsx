import PostCard from "@/components/posts/PostCard";
import Pagination from "@/components/Pagination";
import { PostListResponseData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getPosts(page: number): Promise<PostListResponseData> {
  try {
    const res = await fetch(`${API_URL}/posts?page=${page}&limit=9`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return {
      data: [],
      totalPages: 1,
      currentPage: 1,
      totalItems: 0,
    };
  }
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const { data: posts, currentPage, totalPages } = await getPosts(page);

  return (
    <div className="container mx-auto">
      <div className="text-center max-w-3xl mx-auto my-12 md:my-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          POSTS
        </h1>
        <p className="text-lg text-base-content text-opacity-70">
          Discover insights about everything.
        </p>
      </div>

      <h2 className="text-3xl font-semibold mb-8">Latest Posts</h2>
      <div className="w-full">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-base-content text-opacity-70 py-10">
            No posts found.
          </p>
        )}
      </div>
      {totalPages > 1 && (
         <div className="flex justify-center mt-12">
            <Pagination currentPage={currentPage} totalPages={totalPages} /> 
         </div>
      )}
    </div>
  );
}