import React from 'react';
import { Link } from 'react-router-dom';
import type { CampaignDraft } from '../../lib/merchant/types';

export function CampaignDraftCard({
  draft,
  isZh,
  busy,
  onSave,
}: {
  draft: CampaignDraft;
  isZh: boolean;
  busy?: boolean;
  onSave?: (draft: CampaignDraft) => void | Promise<void>;
  key?: React.Key;
}) {
  return (
    <div className="border border-black/20 p-4">
      <p className="font-display font-bold">{draft.title}</p>
      <p className="mt-1 text-sm text-black/65">{draft.overview || draft.goal}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-black/50">
          ${draft.suggested_budget_min ?? 0}-${draft.suggested_budget_max ?? 0}
        </span>
        {onSave ? (
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={busy}
            className="border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase hover:bg-hopon-grey disabled:opacity-50"
          >
            {busy ? '...' : isZh ? '保存草稿' : 'Save draft'}
          </button>
        ) : (
          <Link to={`/merchant/campaign/new?draftId=${draft.id}`} className="font-mono text-xs uppercase text-hopon-red hover:underline">
            {isZh ? '创建活动' : 'Create campaign'}
          </Link>
        )}
      </div>
    </div>
  );
}
