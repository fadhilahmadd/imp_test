// frontend/components/posts/PostCard.tsx
import Link from 'next/link';
import { Post } from '@/lib/types'; //
import { formatDate } from '@/lib/utils'; //

type Props = {
  post: Post;
};

function AuthorAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  return (
    <div className="avatar placeholder">
      <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
        <span className="text-xs font-semibold">{initial}</span>
      </div>
    </div>
  );
}

export default function PostCard({ post }: Props) {
  const authorName = post.author?.name || 'Unknown';
  const displayDate = formatDate(post.createdAt).split(' at ')[0];

  return (
    <Link href={`/posts/${post.id}`} className="block group h-full">
      <div className="card w-full h-full bg-base-100 shadow border border-base-300 transition-shadow duration-300 ease-in-out hover:shadow-lg overflow-hidden flex flex-col">
        <div className="card-body p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <AuthorAvatar name={authorName} />
            <span className="text-sm font-medium text-base-content text-opacity-80">{authorName}</span>
          </div>

          <h2 className="card-title text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2" style={{ minHeight: '3rem' }}>
            {post.title}
          </h2>

          <p className="text-base-content text-opacity-70 text-sm mb-3 line-clamp-3 flex-grow">
             {post.content.substring(0, 100)}
             {post.content.length > 100 ? '...' : ''}
          </p>

          <p className="text-xs text-base-content text-opacity-60 mt-auto pt-2">
            {displayDate}
          </p>
        </div>
      </div>
    </Link>
  );
}