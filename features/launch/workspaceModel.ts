export type ContentStatus = 'in_review' | 'approved' | 'revision_requested';
export type ContentHistoryItem = { version: number; status: string; detail: string };
export type ContentState = { status: ContentStatus; version: number; feedback: string; history: ContentHistoryItem[] };

export const initialContent = (): ContentState => ({
  status: 'in_review', version: 1, feedback: '',
  history: [{ version: 1, status: '初稿已提交', detail: '等待品牌审核' }],
});

export function reviewContent(current: ContentState, action: 'approve' | 'request_revision' | 'submit_revision', feedback = ''): ContentState {
  if (action === 'approve' && current.status === 'in_review') return { ...current, status: 'approved', history: [...current.history, { version: current.version, status: '审核通过', detail: '品牌已确认这一版内容' }] };
  if (action === 'request_revision' && current.status === 'in_review' && feedback.trim()) return { ...current, status: 'revision_requested', feedback: feedback.trim(), history: [...current.history, { version: current.version, status: '需要修改', detail: feedback.trim() }] };
  if (action === 'submit_revision' && current.status === 'revision_requested') return { ...current, status: 'in_review', version: current.version + 1, history: [...current.history, { version: current.version + 1, status: '新版待审', detail: '演示模拟：创作者已根据反馈提交新版' }] };
  return current;
}

export const shortlistTotal = (selectedIds: string[], quotes: { id: string; quote: number }[]) => quotes.filter(c => selectedIds.includes(c.id)).reduce((sum, c) => sum + c.quote, 0);
