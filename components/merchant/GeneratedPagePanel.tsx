import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import type { GeneratedPage } from '../../lib/merchant/types';

export function GeneratedPagePanel({
  pages,
  isZh,
  busyId,
  onPublish,
}: {
  pages: GeneratedPage[];
  isZh: boolean;
  busyId?: string | null;
  onPublish: (pageId: string) => void;
}) {
  return (
    <div className="border-2 border-black bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <Rocket className="h-5 w-5 text-hopon-red" />
        {isZh ? '生成页面' : 'Generated pages'}
      </h2>
      <div className="mt-5 space-y-3">
        {pages.length === 0 ? (
          <p className="text-sm text-black/55">{isZh ? '暂无页面草稿。' : 'No generated pages yet.'}</p>
        ) : pages.map((page) => (
          <div key={page.id} className="border border-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold">{page.title}</p>
                <p className="mt-1 font-mono text-xs text-black/50">/{page.page_type}/{page.slug}</p>
              </div>
              <span className={`border px-2 py-1 font-mono text-xs uppercase ${page.status === 'published' ? 'border-green-500 bg-green-50 text-green-700' : 'border-black/30 text-black/60'}`}>
                {page.status}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              {page.status !== 'published' && (
                <button
                  type="button"
                  onClick={() => onPublish(page.id)}
                  disabled={busyId === page.id}
                  className="border-2 border-black bg-hopon-black px-3 py-2 font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
                >
                  {busyId === page.id ? '...' : isZh ? '发布' : 'Publish'}
                </button>
              )}
              {page.status === 'published' && (
                <Link to={`/${page.page_type}/${page.slug}`} className="border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase hover:bg-hopon-grey">
                  {isZh ? '查看' : 'View'}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
