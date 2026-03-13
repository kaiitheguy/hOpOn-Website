/**
 * Audit §1 Review: preview draft post or final deliverable (Blanc PostPreviewModal).
 * mode=draft: draftText, draftImages; mode=final: xhsUrl, images, notes.
 */

import React from 'react';
import { isSafeImageUrl } from '../../lib/safeImageUrl';

type PostPreviewMode = 'draft' | 'final';

export type PostPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  mode: PostPreviewMode;
  title: string;
  subtitle?: string;
  draftText?: string | null;
  draftImages?: string[] | null;
  xhsUrl?: string | null;
  screenshotUrl?: string | null;
  screenshotUrls?: string[] | null;
  notes?: string | null;
  isZh?: boolean;
};

function parseLink(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  visible,
  onClose,
  mode,
  title,
  subtitle,
  draftText,
  draftImages,
  xhsUrl,
  screenshotUrl,
  screenshotUrls,
  notes,
  isZh = true,
}) => {
  const finalScreenshots = (screenshotUrls?.length ? screenshotUrls : screenshotUrl ? [screenshotUrl] : []).filter(isSafeImageUrl);
  const draftImgs = (draftImages ?? []).filter(isSafeImageUrl);
  const linkUrl = parseLink(xhsUrl);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-2 border-black max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start p-4 border-b border-black/10 shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-hopon-black">{title}</h2>
            {subtitle && <p className="text-sm text-black/60 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 border-2 border-black hover:bg-hopon-grey transition-colors"
            aria-label={isZh ? '关闭' : 'Close'}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {mode === 'draft' ? (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-black/60">
                {isZh ? '帖子初稿' : 'Draft Post'}
              </p>
              {draftText && <p className="text-sm text-black/80 whitespace-pre-wrap">{draftText}</p>}
              {draftImgs.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {draftImgs.map((uri, idx) => (
                    <img
                      key={`${uri}-${idx}`}
                      src={uri}
                      alt=""
                      className="w-32 h-32 object-cover border border-black/20 shrink-0"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-black/60">
                {isZh ? '小红书链接' : 'XHS Link'}
              </p>
              {linkUrl && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-hopon-black bg-white text-hopon-black font-mono text-xs uppercase hover:bg-hopon-grey"
                  >
                    {isZh ? '打开链接' : 'Open link'}
                  </a>
                </div>
              )}
              {finalScreenshots.length > 0 && (
                <>
                  <p className="font-mono text-xs uppercase tracking-wider text-black/60 mt-4">
                    {isZh ? '截图' : 'Screenshots'}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {finalScreenshots.map((uri, idx) => (
                      <img
                        key={`${uri}-${idx}`}
                        src={uri}
                        alt=""
                        className="w-32 h-32 object-cover border border-black/20 shrink-0"
                      />
                    ))}
                  </div>
                </>
              )}
              {notes && (
                <>
                  <p className="font-mono text-xs uppercase tracking-wider text-black/60 mt-4">
                    {isZh ? '备注' : 'Notes'}
                  </p>
                  <p className="text-sm text-black/80 whitespace-pre-wrap">{notes}</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
