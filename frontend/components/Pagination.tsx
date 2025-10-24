"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="join mt-8">
      <button
        className="join-item btn"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        «
      </button>
      <button className="join-item btn">
        Page {currentPage} of {totalPages}
      </button>
      <button
        className="join-item btn"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        »
      </button>
    </div>
  );
}
