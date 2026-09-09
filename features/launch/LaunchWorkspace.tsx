import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Globe2,
  Instagram,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { LAUNCH_BASE_PATH, LAUNCH_DEMO_PATH, LAUNCH_ASSET_PATH, LAUNCH_BRAND } from './config';
import { initialContent, reviewContent, shortlistTotal, ContentState } from './workspaceModel';
import { ReportsInsights, GeoInsights } from './LaunchInsights';
import './workspace.css';

type ViewKey = 'overview' | 'creators' | 'review' | 'reports' | 'geo';
type ToastKind = 'success' | 'error' | 'info';

type Candidate = {
  id: 'a' | 'b' | 'c';
  initials: string;
  name: string;
  vertical: string;
  location: string;
  audience: string;
  engagement: string;
  quote: number;
  image?: string;
  note: string;
};

const views = [
  { key: 'overview', label: '项目总览', icon: BarChart3 },
  { key: 'creators', label: '创作者', icon: Users },
  { key: 'review', label: '内容审核', icon: FileCheck2 },
  { key: 'reports', label: '素材与报告', icon: FileText },
  { key: 'geo', label: 'GEO', icon: Globe2 },
] as const;

const candidates: Candidate[] = [
  {
    id: 'a',
    initials: 'A',
    name: 'Creator A',
    vertical: '日常通勤与城市生活',
    location: '北美 · 示例档案',
    audience: '城市通勤人群',
    engagement: '通勤场景契合',
    quote: 450,
    note: '用一天的城市生活，呈现包袋真实的使用细节。',
  },
  {
    id: 'b',
    initials: 'B',
    name: 'Creator B',
    vertical: '旅行与实用设计',
    location: '北美 · 示例档案',
    audience: '常旅客与轻出行人群',
    engagement: '实用功能契合',
    quote: 650,
    note: '从通勤到短途旅行，聚焦容量和随身物品收纳。',
  },
  {
    id: 'c',
    initials: 'C',
    name: 'Creator C',
    vertical: '穿搭与新品发现',
    location: '北美 · 示例档案',
    audience: '关注设计的消费者',
    engagement: '适合测试新角度',
    quote: 520,
    note: '以搭配和材质细节切入，尝试更有编辑感的镜头。',
  },
];

const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const viewPath = (view: ViewKey) => (view === 'overview' ? LAUNCH_DEMO_PATH : `${LAUNCH_DEMO_PATH}?view=${view}`);

const isViewKey = (value: string | null): value is ViewKey => views.some((view) => view.key === value);

function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'red' | 'green' }) {
  return <span className={`lw-status-pill lw-status-${tone}`}>{children}</span>;
}

function CandidateAvatar({ candidate }: { candidate: Candidate }) {
  const [failed, setFailed] = useState(!candidate.image);

  return (
    <div className="lw-avatar" role="img" aria-label={`Sample portrait for ${candidate.name}`}>
      {candidate.image && !failed ? (
        <img src={candidate.image} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{candidate.initials}</span>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: string; tone?: 'neutral' | 'red' }) {
  return (
    <div className={`lw-metric-card ${tone === 'red' ? 'lw-metric-card-red' : ''}`}>
      <span className="lw-meta">{label}</span>
      <strong>{value}</strong>
      <span className="lw-meta">{detail}</span>
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: { kind: ToastKind; message: string }; onDismiss: () => void }) {
  return (
    <div className={`lw-toast lw-toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function ViewHeading({ eyebrow, title, copy, aside }: { eyebrow: string; title: string; copy: string; aside?: React.ReactNode }) {
  return (
    <div className="lw-view-heading">
      <div>
        <p className="lw-label lw-accent-label">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="lw-copy">{copy}</p>
      </div>
      {aside ? <div className="lw-heading-aside">{aside}</div> : null}
    </div>
  );
}

function OverviewView({
  selected,
  confirmedIds,
  content,
  exampleSpend,
}: {
  selected: Candidate[];
  confirmedIds: string[];
  content: ContentState;
  exampleSpend: number;
}) {
  const contentLabel = content.status === 'approved' ? '已通过' : content.status === 'revision_requested' ? '待修改' : '待审核';

  return (
    <div className="lw-view">
      <ViewHeading
        eyebrow="PROJECT OVERVIEW"
        title="每一步，都看得见。"
        copy="City Carry 北美首轮推广。团队负责推进，把需要你确认的人选与内容集中在这里。"
        aside={<StatusPill tone="red">示例项目</StatusPill>}
      />

      <div className="lw-metric-grid">
        <MetricCard label="候选创作者" value={`${selected.length} 位`} detail={`${confirmedIds.length} 位已确认`} tone="red" />
        <MetricCard label="当前内容版本" value={`v${content.version}`} detail={contentLabel} />
        <MetricCard label="所选人选费用" value={formatUsd(exampleSpend)} detail="USD · 演示报价合计" />
        <MetricCard label="目标市场" value="北美" detail="Instagram · 生活方式" />
      </div>

      <div className="lw-overview-grid">
        <section className="lw-panel">
          <div className="lw-panel-heading">
            <div>
              <p className="lw-label">CAMPAIGN BRIEF</p>
              <h3>City Carry / Instagram</h3>
            </div>
            <Instagram size={20} aria-hidden="true" />
          </div>
          <dl className="lw-detail-list">
            <div><dt>投放市场</dt><dd>北美 · 首轮推广</dd></div>
            <div><dt>品类方向</dt><dd>日常通勤 · 城市生活</dd></div>
            <div><dt>交付内容</dt><dd>Reel + 原始导出文件</dd></div>
            <div><dt>项目团队</dt><dd>hOpOn Launch</dd></div>
          </dl>
          <details className="lw-details" open>
            <summary>查看项目 Brief</summary>
            <p className="lw-secondary">以北美城市通勤为场景，展示 City Carry 的日常使用体验。内容以创作者个人视角展开，使用自然光、真实生活场景与清楚的产品细节。</p>
          </details>
        </section>

        <section className="lw-panel">
          <div className="lw-panel-heading">
            <div>
              <p className="lw-label">NEXT HANDOFF</p>
              <h3>等你确认的事项</h3>
            </div>
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <div className="lw-action-list">
            <Link to={viewPath('creators')} className="lw-action-row">
              <span><strong>确认创作者名单</strong><small>{confirmedIds.length ? `${confirmedIds.length} 位示例创作者已确认` : '查看团队推荐的 3 位候选人'}</small></span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <Link to={viewPath('review')} className="lw-action-row">
              <span><strong>审核创作者初稿</strong><small>当前版本 v{content.version} · {contentLabel}</small></span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <Link to={viewPath('geo')} className="lw-action-row">
              <span><strong>查看 AI 搜索与内容进度</strong><small>查看示例问题、引用来源与内容任务</small></span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      <div className="lw-overview-grid">
        <section className="lw-panel">
          <div className="lw-panel-heading">
            <div>
              <p className="lw-label">SELECTION BOARD</p>
              <h3>本轮候选人</h3>
            </div>
            <Link className="lw-inline-link" to={viewPath('creators')}>调整 <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {selected.length ? (
            <div className="lw-mini-list">
              {selected.map((candidate) => (
                <div className="lw-mini-row" key={candidate.id}>
                  <CandidateAvatar candidate={candidate} />
                  <span><strong>{candidate.name}</strong><small>{candidate.vertical}</small></span>
                  {confirmedIds.includes(candidate.id) ? <StatusPill tone="green">已确认</StatusPill> : <StatusPill>候选</StatusPill>}
                </div>
              ))}
            </div>
          ) : (
            <div className="lw-empty-state"><Users size={21} aria-hidden="true" /><p>暂未选择创作者。</p><Link to={viewPath('creators')} className="lw-text-link">查看候选人</Link></div>
          )}
        </section>

        <section className="lw-panel">
          <div className="lw-panel-heading">
            <div>
              <p className="lw-label">OPERATING MODEL</p>
              <h3>从人选到交付</h3>
            </div>
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>
          <ul className="lw-check-list">
            <li><Check size={16} aria-hidden="true" /> <span>你确认人选、合作范围和内容。</span></li>
            <li><Check size={16} aria-hidden="true" /> <span>团队负责沟通、寄样和制作进度。</span></li>
            <li><Check size={16} aria-hidden="true" /> <span>通过审核后，集中交付素材与授权记录。</span></li>
          </ul>
          <p className="lw-secondary lw-panel-note">GEO 与独立站内容可单独开展，也可以和本轮创作者项目配合。</p>
        </section>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, selected, confirmed, onToggle }: { candidate: Candidate; selected: boolean; confirmed: boolean; onToggle: () => void; key?: React.Key }) {
  return (
    <article className={`lw-candidate-card ${selected ? 'lw-card-selected' : ''}`}>
      <div className="lw-candidate-top">
        <CandidateAvatar candidate={candidate} />
        <div>
          <p className="lw-label">SAMPLE CANDIDATE {candidate.id.toUpperCase()}</p>
          <h3>{candidate.name}</h3>
          <p className="lw-secondary">{candidate.location}</p>
        </div>
        {confirmed ? <StatusPill tone="green">已确认</StatusPill> : selected ? <StatusPill tone="red">已选择</StatusPill> : null}
      </div>
      <p className="lw-candidate-note">{candidate.note}</p>
      <dl className="lw-candidate-stats">
        <div><dt>内容方向</dt><dd>{candidate.vertical}</dd></div>
        <div><dt>受众</dt><dd>{candidate.audience}</dd></div>
        <div><dt>推荐理由</dt><dd>{candidate.engagement}</dd></div>
      </dl>
      <div className="lw-candidate-footer">
        <span className="lw-example-quote">示例报价 · {formatUsd(candidate.quote)}</span>
        <button type="button" className={selected ? 'lw-button lw-button-outline' : 'lw-button lw-button-dark'} onClick={onToggle} aria-pressed={selected}>
          {selected ? <X size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          {selected ? '移出名单' : '选择人选'}
        </button>
      </div>
    </article>
  );
}

function CreatorsView({
  selectedIds,
  confirmedIds,
  exampleSpend,
  onToggle,
  onConfirm,
}: {
  selectedIds: string[];
  confirmedIds: string[];
  exampleSpend: number;
  onToggle: (id: Candidate['id']) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="lw-view">
      <ViewHeading
        eyebrow="CREATOR SOURCING"
        title="找到讲好产品的人。"
        copy="团队根据 City Carry 的风格、受众和合作范围准备了这份名单。选择合适的人选，再统一确认。"
        aside={<StatusPill>3 位示例候选人</StatusPill>}
      />
      <div className="lw-selection-summary">
        <div>
          <p className="lw-label">SHORTLIST SUMMARY</p>
          <strong>已选择 {selectedIds.length} 位创作者</strong>
          <span className="lw-secondary">{confirmedIds.length} 位已确认 · 示例费用合计 {formatUsd(exampleSpend)}</span>
        </div>
        <button type="button" className="lw-button lw-button-red" onClick={onConfirm}>
          {confirmedIds.length ? '更新确认名单' : '确认合作人选'} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="lw-candidate-grid">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} selected={selectedIds.includes(candidate.id)} confirmed={confirmedIds.includes(candidate.id)} onToggle={() => onToggle(candidate.id)} />
        ))}
      </div>
      <p className="lw-secondary lw-disclaimer">人选、契合度与报价均为演示示例。确认操作只更新当前 Demo。</p>
    </div>
  );
}

function ReviewView({
  content,
  feedback,
  feedbackError,
  onFeedbackChange,
  onApprove,
  onRequestRevision,
  onSubmitRevision,
}: {
  content: ContentState;
  feedback: string;
  feedbackError: string;
  onFeedbackChange: (value: string) => void;
  onApprove: () => void;
  onRequestRevision: () => void;
  onSubmitRevision: () => void;
}) {
  const contentLabel = content.status === 'approved' ? '已通过' : content.status === 'revision_requested' ? '待修改' : '待审核';
  const tone = content.status === 'approved' ? 'green' : content.status === 'revision_requested' ? 'red' : 'neutral';

  return (
    <div className="lw-view">
      <ViewHeading
        eyebrow="CONTENT REVIEW"
        title="好内容，一起打磨。"
        copy="查看概念初稿，集中给出修改意见，或确认这一版进入交付。每次决定都会保留在版本记录中。"
        aside={<StatusPill tone={tone}>{contentLabel} · v{content.version}</StatusPill>}
      />
      <div className="lw-review-grid">
        <section className="lw-panel lw-draft-panel">
          <div className="lw-panel-heading">
            <div><p className="lw-label">DRAFT ASSET</p><h3>City Carry / 城市日常</h3></div>
            <span className="lw-secondary">概念稿 · v{content.version}</span>
          </div>
          <div className="lw-draft-canvas">
            <div className="lw-draft-top"><span><Instagram size={14} aria-hidden="true" /> Instagram draft</span><span>v{content.version}</span></div>
            <div className="lw-draft-art"><img src={`${LAUNCH_ASSET_PATH}/hero.webp`} alt="Concept image of a woman carrying a red tote in a city" /><div className="lw-draft-art-copy"><span>NORTHLINE</span><strong>City<br />Carry</strong><em>CONCEPT PREVIEW / SAMPLE CUT</em></div></div>
            <div className="lw-draft-caption"><span>Paid creator draft</span><span>Editorial cut · example</span></div>
          </div>
          <p className="lw-secondary">AI 概念分镜图，用于演示审核流程；不是实际视频或已发布内容。</p>
        </section>

        <section className="lw-panel lw-review-panel">
          <div className="lw-panel-heading"><div><p className="lw-label">BRAND DECISION</p><h3>这版内容，可以了吗？</h3></div><FileCheck2 size={20} aria-hidden="true" /></div>
          <div className="lw-review-state"><span className="lw-meta">当前状态</span><strong>{contentLabel}</strong><span className="lw-secondary">v{content.version} 的决定将保留在项目记录中。</span></div>
          <label className="lw-field-label" htmlFor="revision-feedback">修改意见 <span>申请修改时必填</span></label>
          <textarea disabled={content.status !== 'in_review'} maxLength={1500} id="revision-feedback" className="lw-textarea" value={feedback} onChange={(event) => onFeedbackChange(event.target.value)} placeholder="例如：请增加包内收纳的近景，结尾保留完整产品名称。" aria-invalid={Boolean(feedbackError)} aria-describedby={feedbackError ? 'revision-feedback-error' : undefined} />
          {feedbackError ? <p id="revision-feedback-error" className="lw-form-error" role="alert">{feedbackError}</p> : <p className="lw-secondary">把意见写在一起，方便创作者一次完成修改。</p>}
          {content.status === 'revision_requested' && <div className="lw-revision-next"><p><b>修改意见已记录</b>{content.feedback}</p><button type="button" className="lw-button lw-button-red" onClick={onSubmitRevision}>模拟创作者提交新版 <ArrowRight size={16}/></button><small>演示操作，下一版将重新进入审核。</small></div>}
          {content.status === 'approved' && <Link className="lw-approved-link" to={viewPath('reports')}>已通过审核，查看交付素材 <ArrowRight size={16}/></Link>}
          <div className="lw-review-actions">
            <button type="button" className="lw-button lw-button-dark" disabled={content.status !== 'in_review'} onClick={onApprove}><Check size={16} aria-hidden="true" /> 通过审核</button>
            <button type="button" className="lw-button lw-button-outline" disabled={content.status !== 'in_review'} onClick={onRequestRevision}><RotateCcw size={16} aria-hidden="true" /> 要求修改</button>
          </div>
        </section>
      </div>
      <section className="lw-panel lw-history-panel">
        <div className="lw-panel-heading"><div><p className="lw-label">VERSION HISTORY</p><h3>每个版本，都有记录。</h3></div><span className="lw-secondary">当前演示会话</span></div>
        <div className="lw-history-list">
          {content.history.map((item, index) => <div className="lw-history-row" key={`${item.version}-${item.status}-${index}`}><span className="lw-history-version">v{item.version}</span><span><strong>{item.status}</strong><small>{item.detail}</small></span><span className="lw-secondary">{index === content.history.length - 1 ? '最新' : '已记录'}</span></div>)}
        </div>
      </section>
    </div>
  );
}

export default function LaunchWorkspace() {
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>(['a', 'b']);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [content, setContent] = useState<ContentState>(() => initialContent());
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [demoResetToken, setDemoResetToken] = useState(0);
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const requestedView = searchParams.get('view');
  const activeView: ViewKey = isViewKey(requestedView) ? requestedView : 'overview';
  const selected = useMemo(() => candidates.filter((candidate) => selectedIds.includes(candidate.id)), [selectedIds]);
  const exampleSpend = useMemo(() => shortlistTotal(selectedIds, candidates), [selectedIds]);

  const showToast = (kind: ToastKind, message: string) => setToast({ kind, message });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Launch Workspace · hOpOn';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleCandidate = (id: Candidate['id']) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((current) => current.filter((candidateId) => candidateId !== id));
      setConfirmedIds((current) => current.filter((candidateId) => candidateId !== id));
      showToast('info', `已将 Creator ${id.toUpperCase()} 移出名单。`);
      return;
    }
    setSelectedIds((current) => [...current, id]);
    showToast('success', `已将 Creator ${id.toUpperCase()} 加入名单。`);
  };

  const confirmSelection = () => {
    if (!selectedIds.length) {
      showToast('error', '请至少选择一位创作者。');
      return;
    }
    setConfirmedIds([...selectedIds]);
    showToast('success', `已确认 ${selectedIds.length} 位创作者，本次操作仅用于演示。`);
  };

  const approveContent = () => {
    if (content.status !== 'in_review') return;
    setContent(current => reviewContent(current, 'approve'));
    setFeedbackError('');
    showToast('success', `v${content.version} 已通过审核，可在素材与报告中查看。`);
  };

  const requestRevision = () => {
    if (content.status !== 'in_review') return;
    if (!feedback.trim()) {
      setFeedbackError('请写下需要修改的内容。');
      return;
    }
    setContent(current => reviewContent(current, 'request_revision', feedback));
    setFeedbackError('');
    setFeedback('');
    showToast('success', '修改意见已记录在演示项目中。');
  };

  const submitRevision = () => {
    setContent(current => reviewContent(current, 'submit_revision'));
    showToast('info', '已模拟新版提交，现在可以再次审核。');
  };

  const resetDemo = () => {
    setDemoResetToken(token => token + 1);
    setSelectedIds(['a', 'b']);
    setConfirmedIds([]);
    setContent(initialContent());
    setFeedback('');
    setFeedbackError('');
    showToast('info', '已重置为初始示例项目。');
  };

  return (
    <div className="launch-workspace" lang="zh-CN"><a className="lw-skip" href="#launch-project-content">跳至项目内容</a>
      <aside className="lw-sidebar" aria-label="Launch workspace navigation">
        <div className="lw-sidebar-brand"><Link to={LAUNCH_BASE_PATH} className="lw-brand"><span>{LAUNCH_BRAND.name}</span><small>{LAUNCH_BRAND.label}</small></Link><span className="lw-sidebar-kicker">BRAND WORKSPACE</span></div>
        <nav className="lw-sidebar-nav" aria-label="Project views">
          {views.map(({ key, label, icon: Icon }) => <Link key={key} to={viewPath(key)} className={`lw-nav-link ${activeView === key ? 'lw-nav-active' : ''}`} aria-current={activeView === key ? 'page' : undefined}><Icon size={17} aria-hidden="true" /><span>{label}</span>{activeView === key ? <ChevronRight className="lw-nav-arrow" size={15} aria-hidden="true" /> : null}</Link>)}
        </nav>
        <div className="lw-sidebar-project"><span className="lw-label">CURRENT PROJECT</span><strong>NORTHLINE</strong><span>City Carry / Instagram</span><StatusPill tone="red">示例项目</StatusPill></div>
        <div className="lw-sidebar-footer"><span>Your brand. Your workspace.</span><span>演示会话 · 刷新后重置</span></div>
      </aside>

      <main className="lw-main">
        <div className="lw-demo-banner"><span className="lw-demo-dot" aria-hidden="true" />交互演示 · 虚构品牌与数据 · 不会发送消息或付款</div>
        <header className="lw-topbar">
          <div><p className="lw-label lw-topbar-eyebrow">BRAND WORKSPACE / PROJECT 001</p><div className="lw-topbar-title"><h1>NORTHLINE</h1><StatusPill tone="red">示例项目</StatusPill></div><p className="lw-topbar-subtitle">City Carry · 北美 Instagram 付费合作</p></div>
          <div className="lw-topbar-actions"><button type="button" className="lw-button lw-button-outline" onClick={resetDemo}><RotateCcw size={16} aria-hidden="true" /> 重置演示</button><Link to={LAUNCH_BASE_PATH} className="lw-back-link">返回品牌首页 <ArrowRight size={15} aria-hidden="true" /></Link></div>
        </header>

        <div className="lw-mobile-tabs" aria-label="Project views">
          {views.map(({ key, label }) => <Link key={key} to={viewPath(key)} className={activeView === key ? 'lw-mobile-tab-active' : ''} aria-current={activeView === key ? 'page' : undefined}>{label}</Link>)}
        </div>

        <div className="lw-main-content" id="launch-project-content" key={demoResetToken}>
          {activeView === 'overview' ? <OverviewView selected={selected} confirmedIds={confirmedIds} content={content} exampleSpend={exampleSpend} /> : null}
          {activeView === 'creators' ? <CreatorsView selectedIds={selectedIds} confirmedIds={confirmedIds} exampleSpend={exampleSpend} onToggle={toggleCandidate} onConfirm={confirmSelection} /> : null}
          {activeView === 'review' ? <ReviewView content={content} feedback={feedback} feedbackError={feedbackError} onFeedbackChange={(value) => { setFeedback(value); if (feedbackError) setFeedbackError(''); }} onApprove={approveContent} onRequestRevision={requestRevision} onSubmitRevision={submitRevision} /> : null}
          {activeView === 'reports' ? <ReportsInsights selectedCount={selected.length} confirmedCount={confirmedIds.length} spend={exampleSpend} approved={content.status === 'approved'} version={content.version} reviewStatus={content.status} /> : null}
          {activeView === 'geo' ? <GeoInsights /> : null}
        </div>
      </main>
      {toast ? <Toast toast={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
