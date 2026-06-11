import React from 'react';
import type { PlatformScore } from '../../lib/merchant/growthScoring';

export function PlatformScorePanel({ scores, title }: { scores: PlatformScore[]; title: string }) {
  return (
    <div className="border-2 border-black bg-white p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-5 space-y-4">
        {scores.map((item) => (
          <div key={item.platform}>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-black/70">{item.platform}</span>
              <span className="font-mono text-xs">{item.score}</span>
            </div>
            <div className="h-2 border border-black bg-white">
              <div className="h-full bg-hopon-red" style={{ width: `${item.score}%` }} />
            </div>
            <p className="mt-1 text-xs text-black/50">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
