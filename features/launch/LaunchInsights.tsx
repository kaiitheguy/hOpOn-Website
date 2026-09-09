import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Download,
  FileCheck2,
  FileImage,
  Globe2,
  Info,
  Lightbulb,
  Lock,
  SearchX,
  Target,
} from 'lucide-react';
import { LAUNCH_ASSET_PATH } from './config';
import './insights.css';

export type ReportsInsightsProps = {
  selectedCount: number;
  confirmedCount: number;
  spend: number;
  approved: boolean;
  version: number;
  reviewStatus?: 'in_review' | 'approved' | 'revision_requested';
};

type DownloadState = 'idle' | 'report' | 'image';

const REPORT_DISCLAIMER = '示例报告 · 模拟数据，不代表实际投放结果';
const GEO_DISCLAIMER = 'GEO 示例监测 · 未连接真实搜索';
const REPORT_PERIOD = '示例项目周期 · 2026.06.01—06.30';

const reportMetrics = [
  { label: '触达 / REACH', value: '42,800', detail: '示例累计人数', accent: true },
  { label: '展示 / IMPRESSIONS', value: '61,200', detail: '总展示次数' },
  { label: '互动 / ENGAGEMENT', value: '1,840', detail: '互动率 · 3.0%' },
  { label: '链接点击 / CLICKS', value: '620', detail: '点击率 · 1.0%' },
] as const;

const reportWeeks = [
  { week: 'W1', impressions: 8400, clicks: 80 },
  { week: 'W2', impressions: 17900, clicks: 110 },
  { week: 'W3', impressions: 28300, clicks: 145 },
  { week: 'W4', impressions: 43600, clicks: 180 },
  { week: 'W5', impressions: 61200, clicks: 105 },
];
const reportChart = {
  points: reportWeeks.map((week, index) => ({ x: 84 + index * 138, y: 256 - week.impressions / 64000 * 192, label: week.week, value: `${(week.impressions / 1000).toFixed(1)}k` })),
  bars: reportWeeks.map((week, index) => ({ x: 62 + index * 138, y: 256 - week.clicks / 200 * 192, height: week.clicks / 200 * 192, label: week.week, value: String(week.clicks) })),
};

const formatInteger = (value: number) => new Intl.NumberFormat('en-US').format(value);

const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function InsightMetric({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
  key?: React.Key;
}) {
  return (
    <div className={`li-metric-card ${accent ? 'li-metric-card-accent' : ''}`}>
      <span className="li-metric-label">{label}</span>
      <strong className="li-metric-value">{value}</strong>
      <span className="li-metric-detail">{detail}</span>
    </div>
  );
}

function PageKicker({ children, meta }: { children: React.ReactNode; meta: string; key?: React.Key }) {
  return (
    <div className="li-kicker">
      <span className="li-kicker-dot" aria-hidden="true" />
      <span>{children}</span>
      <span className="li-kicker-meta">{meta}</span>
    </div>
  );
}

function PanelHeading({
  label,
  title,
  titleId,
  icon,
  aside,
}: {
  label: string;
  title: string;
  titleId?: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  key?: React.Key;
}) {
  return (
    <div className="li-panel-heading">
      <div>
        <p className="li-panel-label">{label}</p>
        <h3 id={titleId} className="li-panel-title">{title}</h3>
      </div>
      {aside ?? icon ? <div className="li-panel-heading-aside">{aside ?? icon}</div> : null}
    </div>
  );
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: 'approved' | 'draft' | 'neutral'; key?: React.Key }) {
  return <span className={`li-status-pill li-status-${tone}`}>{children}</span>;
}

export function ReportsInsights({ selectedCount, confirmedCount, spend, approved, version, reviewStatus }: ReportsInsightsProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const safeVersion = Number.isFinite(version) ? version : 1;
  const reviewLabel = approved ? '已通过' : reviewStatus === 'revision_requested' ? '待修改' : '待审核';
  const safeSelectedCount = Number.isFinite(selectedCount) ? selectedCount : 0;
  const safeConfirmedCount = Number.isFinite(confirmedCount) ? confirmedCount : 0;
  const safeSpend = Number.isFinite(spend) ? spend : 0;

  const downloadReport = () => {
    const rows: Array<Array<string | number>> = [
      ['section', 'field', 'value', 'scope', 'note'],
      ['report', 'report status', reviewStatus ?? (approved ? 'approved' : 'draft'), 'NORTHLINE / City Carry', 'Workflow status is passed in from the demo review tab.'],
      ['report', 'content version', `v${safeVersion}`, 'NORTHLINE / City Carry', 'Sample project version.'],
      ['report', 'report period', REPORT_PERIOD, 'NORTHLINE / City Carry', 'Example period for the demo; not a current campaign result.'],
      ['scope', 'selected creators', safeSelectedCount, 'Campaign setup', 'Example creator selection count.'],
      ['scope', 'confirmed creators', safeConfirmedCount, 'Campaign setup', 'Example confirmed count.'],
      ['scope', 'creator spend (USD)', safeSpend, 'Campaign setup', 'Example quote total; no payment is initiated.'],
      ['metric', 'reach', 42800, 'Synthetic report metric', 'Example only.'],
      ['metric', 'impressions', 61200, 'Synthetic report metric', 'Example only.'],
      ['metric', 'engagement', 1840, 'Synthetic report metric', 'Example only.'],
      ['metric', 'link clicks', 620, 'Synthetic report metric', 'Example only.'],
      ['note', 'data status', REPORT_DISCLAIMER, 'Entire file', 'No external data source is connected.'],
    ];
    downloadBlob(`\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\n')}`, 'northline-demo-report.csv', 'text/csv;charset=utf-8');
    setDownloadState('report');
  };

  const downloadArtwork = () => {
    if (!approved) return;
    const anchor = document.createElement('a');
    anchor.href = `${LAUNCH_ASSET_PATH}/hero.webp`;
    anchor.download = `northline-concept-v${safeVersion}.webp`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setDownloadState('image');
  };

  const downloadStatus = downloadState === 'report'
    ? '已生成示例报告 CSV，文件内标有模拟数据说明。'
    : downloadState === 'image'
      ? '概念图下载已开始，与上方预览使用同一文件。'
      : '';

  return (
    <div className="launch-insights li-reports" lang="zh-CN">
      <div className="li-page-header">
        <div className="li-heading-block">
          <PageKicker meta="PERFORMANCE REPORT">项目报告</PageKicker>
          <h2 className="li-page-title">把内容与结果，放在一起。</h2>
          <p className="li-page-copy">把内容审核、交付状态和一组可读的示例信号放在同一个项目报告里。</p>
        </div>
        <div className="li-header-meta">
          <span className="li-disclaimer-pill">{REPORT_DISCLAIMER}</span>
          <span className="li-period">{REPORT_PERIOD} · SAMPLE PROJECT</span>
        </div>
      </div>

      <div className="li-metric-strip" aria-label="示例项目指标">
        {reportMetrics.map((metric) => <InsightMetric key={metric.label} {...metric} />)}
      </div>

      <div className="li-report-grid">
        <section className="li-panel li-chart-panel" aria-labelledby="li-report-chart-title">
          <PanelHeading label="CAMPAIGN SIGNALS" title="推广趋势" titleId="li-report-chart-title" icon={<BarChart3 size={20} aria-hidden="true" />} />
          <div className="li-chart-legend" aria-label="图表图例">
            <span className="li-legend-item"><i className="li-legend-swatch li-legend-line" aria-hidden="true" />展示次数 · 左轴</span>
            <span className="li-legend-item"><i className="li-legend-swatch li-legend-bar" aria-hidden="true" />链接点击 · 右轴</span>
            <span className="li-chart-period">W1—W5 · example</span>
          </div>
          <figure className="li-chart-shell">
            <div className="li-chart-scroll" role="region" aria-label="推广趋势图，可横向滚动" tabIndex={0}><svg className="li-chart-svg" viewBox="0 0 720 300" role="img" aria-labelledby="li-report-chart-svg-title li-report-chart-description">
              <title id="li-report-chart-svg-title">示例展示次数与链接点击趋势</title>
              <desc id="li-report-chart-description">五个示例周次的累计展示次数折线，以及链接点击柱状图。</desc>
              {[64, 112, 160, 208, 256].map((y) => <line key={y} className="li-chart-gridline" x1="46" x2="684" y1={y} y2={y} />)}
              {[{ y: 64, label: '64k' }, { y: 112, label: '48k' }, { y: 160, label: '32k' }, { y: 208, label: '16k' }, { y: 256, label: '0' }].map((item) => <text key={item.y} className="li-chart-y-label" x="0" y={item.y + 4}>{item.label}</text>)}
              {[{ y: 64, label: '200' }, { y: 112, label: '150' }, { y: 160, label: '100' }, { y: 208, label: '50' }, { y: 256, label: '0' }].map(item => <text key={item.y} className="li-chart-y-label" x="690" y={item.y + 4}>{item.label}</text>)}
              {reportChart.bars.map((bar) => <g key={bar.label}><rect className="li-chart-bar" x={bar.x} y={bar.y} width="44" height={bar.height} rx="1" /><text className="li-chart-value" x={bar.x + 22} y={bar.y - 8} textAnchor="middle">{bar.value}</text></g>)}
              <polyline className="li-chart-line" points={reportChart.points.map((point) => `${point.x},${point.y}`).join(' ')} />
              {reportChart.points.map((point) => <g key={point.label}><circle className="li-chart-point" cx={point.x} cy={point.y} r="5" /><text className="li-chart-line-value" x={point.x} y={point.y - 13} textAnchor="middle">{point.value}</text><text className="li-chart-x-label" x={point.x} y="280" textAnchor="middle">{point.label}</text></g>)}
            </svg></div>
            <figcaption>折线按左轴显示累计展示次数，柱状按右轴显示当期点击数；点击合计 620，均为模拟数据。</figcaption>
          </figure>
        </section>

        <section className="li-panel li-asset-panel" aria-labelledby="li-assets-title">
          <PanelHeading
            label="CONTENT ASSETS"
            title="内容资产"
            titleId="li-assets-title"
            icon={<FileCheck2 size={20} aria-hidden="true" />}
            aside={<StatusPill tone={approved ? 'approved' : 'draft'}>{`${reviewLabel} · v${safeVersion}`}</StatusPill>}
          />
          <div className="li-asset-preview">
            <img className="li-asset-image" src={`${LAUNCH_ASSET_PATH}/hero.webp`} alt="AI 概念画面：城市创作者携带红色托特包" />
            <div className="li-asset-overlay">
              <span className="li-asset-overlay-label">AI CONCEPT / SAMPLE</span>
              <strong className="li-asset-overlay-title">City<br />Carry</strong>
              <span className="li-asset-overlay-meta">CONCEPT IMAGE · v{safeVersion}</span>
            </div>
          </div>
          <div className="li-asset-caption">
            <div className="li-asset-caption-main"><span className="li-asset-caption-name">City Carry / 城市日常</span><span>AI 概念图 · 非视频文件</span></div>
            <span className="li-asset-caption-meta">/ 01</span>
          </div>
          <div className="li-approval-status">
            <span className={`li-approval-dot ${approved ? 'li-approval-dot-approved' : ''}`} aria-hidden="true" />
            <div className="li-approval-copy">
              <strong>{approved ? `v${safeVersion} 已通过审核` : `v${safeVersion} 仍是草稿`}</strong>
              <span>{approved ? '可下载已审核的概念图。' : '通过审核后，即可下载这份概念图。'}</span>
            </div>
          </div>
          <div className="li-asset-list" aria-label="内容资产状态">
            <div className="li-asset-row">
              <span className="li-asset-row-icon"><FileImage size={17} aria-hidden="true" /></span>
              <span className="li-asset-row-copy"><strong>AI 概念图</strong><small>与审核页一致的概念视觉 · WebP</small></span>
              <StatusPill tone={approved ? 'approved' : 'draft'}>{approved ? '可下载' : '待审核'}</StatusPill>
            </div>
            <div className="li-asset-row">
              <span className="li-asset-row-icon"><Lock size={17} aria-hidden="true" /></span>
              <span className="li-asset-row-copy"><strong>创作者视频成片</strong><small>此 Demo 未提供视频文件</small></span>
              <StatusPill tone="neutral">未生成</StatusPill>
            </div>
          </div>
          <div className="li-download-actions">
            <div className="li-download-buttons">
              <button type="button" className="li-button li-button-dark" onClick={downloadReport}>
                <Download size={16} aria-hidden="true" /> 下载报告 CSV
              </button>
              <button
                type="button"
                className={`li-button li-button-outline ${!approved ? 'li-button-disabled' : ''}`}
                onClick={downloadArtwork}
                disabled={!approved}
                aria-describedby="li-storyboard-help"
              >
                {approved ? <FileImage size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
                {approved ? '下载概念图 WebP' : '审核后下载概念图'}
              </button>
            </div>
            <p id="li-storyboard-help" className="li-download-help">下载的是上方预览所用的概念图，适合讨论视觉方向。</p>
            <p className="li-download-status" role="status" aria-live="polite">{downloadStatus}</p>
          </div>
        </section>
      </div>

      <section className="li-panel li-scope-panel" aria-labelledby="li-scope-title">
        <div className="li-scope-intro">
          <p className="li-panel-label">PROJECT SCOPE</p>
          <h3 id="li-scope-title" className="li-panel-title">示例项目范围</h3>
          <p>人选、示例费用与审核状态会跟随你在项目中的操作更新。</p>
        </div>
        <dl className="li-scope-list">
          <div className="li-scope-row"><dt>人选范围</dt><dd>{safeConfirmedCount} / {safeSelectedCount} 位已确认 / 已选择</dd></div>
          <div className="li-scope-row"><dt>示例报价</dt><dd>{formatUsd(safeSpend)} · USD</dd></div>
          <div className="li-scope-row"><dt>审核状态</dt><dd>{`${reviewLabel} · v${safeVersion}`}</dd></div>
          <div className="li-scope-row"><dt>报告周期</dt><dd>2026.06.01—06.30 · 示例</dd></div>
        </dl>
        <div className="li-footer-note"><Info size={16} aria-hidden="true" /><span>{REPORT_DISCLAIMER}</span></div>
      </section>
    </div>
  );
}

type GeoModelKey = 'chatgpt' | 'gemini' | 'perplexity';
type GeoFilter = 'all' | 'mentioned' | 'not_mentioned';
type PromptStatus = 'mentioned' | 'not_mentioned';

type GeoPrompt = {
  id: string;
  question: string;
  status: PromptStatus;
  citations: number;
  answer: string;
  sourceCategory: string;
};

type GeoSource = {
  label: string;
  meta: string;
  count: number;
};

type GeoModel = {
  name: string;
  meta: string;
  short: string;
  prompts: GeoPrompt[];
  sourceMix: GeoSource[];
};

const geoModels: Record<GeoModelKey, GeoModel> = {
  chatgpt: {
    name: 'ChatGPT',
    meta: 'OpenAI · example monitor',
    short: 'C',
    prompts: [
      { id: 'chatgpt-1', question: '北美通勤场景适合什么城市托特包？', status: 'mentioned', citations: 3, answer: '在这份模拟回答里，NORTHLINE City Carry 被列为适合城市通勤的示例选择，回答提到了轻量和日常收纳。', sourceCategory: '品牌官网 · 模拟类别' },
      { id: 'chatgpt-2', question: '想找轻便、可装 13 英寸电脑的城市托特包，有哪些推荐？', status: 'mentioned', citations: 2, answer: '模拟回答将 NORTHLINE 作为一个可比较的城市托特包例子，并把电脑隔层与重量列为选购条件。', sourceCategory: '品牌官网 / 测评文章 · 模拟类别' },
      { id: 'chatgpt-3', question: '日常通勤，哪个城市托特包更适合地铁出行？', status: 'not_mentioned', citations: 0, answer: '此示例回答讨论了开口方式与肩带长度，但没有出现 NORTHLINE。', sourceCategory: '社区讨论 · 模拟类别' },
      { id: 'chatgpt-4', question: '适合周末短途旅行的耐用托特包怎么选？', status: 'mentioned', citations: 1, answer: '模拟回答在短途旅行的比较段落中提到 City Carry，并标记了容量与耐用度两个观察点。', sourceCategory: '第三方测评 · 模拟类别' },
      { id: 'chatgpt-5', question: '红色通勤托特包有哪些简约品牌？', status: 'mentioned', citations: 1, answer: '模拟回答把 NORTHLINE 放在红色城市包袋的示例品牌列表中；此处没有真实排名或推荐保证。', sourceCategory: '零售目录 · 模拟类别' },
      { id: 'chatgpt-6', question: '在北美哪里可以买到防泼水城市托特包？', status: 'not_mentioned', citations: 0, answer: '此示例回答聚焦于防泼水材质与购买渠道，没有出现 NORTHLINE。', sourceCategory: '零售目录 · 模拟类别' },
    ],
    sourceMix: [
      { label: '品牌官网', meta: 'Brand-owned', count: 3 },
      { label: '第三方测评', meta: 'Independent review', count: 2 },
      { label: '零售目录', meta: 'Retail / catalog', count: 1 },
      { label: '社区讨论', meta: 'Community / forum', count: 1 },
    ],
  },
  gemini: {
    name: 'Gemini',
    meta: 'Google · example monitor',
    short: 'G',
    prompts: [
      { id: 'gemini-1', question: '北美通勤场景适合什么城市托特包？', status: 'mentioned', citations: 2, answer: '模拟回答把 NORTHLINE City Carry 作为城市通勤包的示例，并提到可从容量、重量和肩带设计比较。', sourceCategory: '品牌官网 · 模拟类别' },
      { id: 'gemini-2', question: '想找轻便、可装 13 英寸电脑的城市托特包，有哪些推荐？', status: 'not_mentioned', citations: 0, answer: '此示例回答提到了电脑尺寸和包体重量，但没有出现 NORTHLINE。', sourceCategory: '第三方测评 · 模拟类别' },
      { id: 'gemini-3', question: '日常通勤，哪个城市托特包更适合地铁出行？', status: 'mentioned', citations: 1, answer: '模拟回答在地铁通勤段落中提到 City Carry，并把包口与肩背舒适度列为观察点。', sourceCategory: '社区讨论 · 模拟类别' },
      { id: 'gemini-4', question: '适合周末短途旅行的耐用托特包怎么选？', status: 'mentioned', citations: 2, answer: '模拟回答把 NORTHLINE 放进短途旅行的比较示例，并提到容量与耐用材质。', sourceCategory: '零售目录 / 品牌官网 · 模拟类别' },
      { id: 'gemini-5', question: '红色通勤托特包有哪些简约品牌？', status: 'not_mentioned', citations: 0, answer: '此示例回答列出几个颜色与风格筛选方向，没有出现 NORTHLINE。', sourceCategory: '零售目录 · 模拟类别' },
      { id: 'gemini-6', question: '在北美哪里可以买到防泼水城市托特包？', status: 'mentioned', citations: 1, answer: '模拟回答提到 NORTHLINE 作为防泼水城市包袋的示例，但没有提供真实店铺链接或购买结论。', sourceCategory: '品牌官网 · 模拟类别' },
    ],
    sourceMix: [
      { label: '品牌官网', meta: 'Brand-owned', count: 2 },
      { label: '第三方测评', meta: 'Independent review', count: 1 },
      { label: '零售目录', meta: 'Retail / catalog', count: 2 },
      { label: '社区讨论', meta: 'Community / forum', count: 1 },
    ],
  },
  perplexity: {
    name: 'Perplexity',
    meta: 'Search answer · example monitor',
    short: 'P',
    prompts: [
      { id: 'perplexity-1', question: '北美通勤场景适合什么城市托特包？', status: 'not_mentioned', citations: 0, answer: '此示例回答比较了通勤包的容量和背负方式，没有出现 NORTHLINE。', sourceCategory: '第三方测评 · 模拟类别' },
      { id: 'perplexity-2', question: '想找轻便、可装 13 英寸电脑的城市托特包，有哪些推荐？', status: 'mentioned', citations: 3, answer: '模拟回答将 NORTHLINE City Carry 列为电脑通勤包的比较示例，并提到收纳结构。', sourceCategory: '品牌官网 / 第三方测评 · 模拟类别' },
      { id: 'perplexity-3', question: '日常通勤，哪个城市托特包更适合地铁出行？', status: 'not_mentioned', citations: 0, answer: '此示例回答聚焦于地铁出行的防盗与肩带细节，没有出现 NORTHLINE。', sourceCategory: '社区讨论 · 模拟类别' },
      { id: 'perplexity-4', question: '适合周末短途旅行的耐用托特包怎么选？', status: 'mentioned', citations: 2, answer: '模拟回答在短途旅行的产品比较中提到 NORTHLINE，并列出容量和材质作为观察项。', sourceCategory: '第三方测评 · 模拟类别' },
      { id: 'perplexity-5', question: '红色通勤托特包有哪些简约品牌？', status: 'mentioned', citations: 1, answer: '模拟回答将 NORTHLINE 放进红色通勤包的示例列表；列表顺序不表示真实排名。', sourceCategory: '零售目录 · 模拟类别' },
      { id: 'perplexity-6', question: '在北美哪里可以买到防泼水城市托特包？', status: 'mentioned', citations: 2, answer: '模拟回答以 NORTHLINE 作为防泼水城市包的示例，并提示查看产品页面中的材质说明。', sourceCategory: '品牌官网 / 零售目录 · 模拟类别' },
    ],
    sourceMix: [
      { label: '品牌官网', meta: 'Brand-owned', count: 2 },
      { label: '第三方测评', meta: 'Independent review', count: 3 },
      { label: '零售目录', meta: 'Retail / catalog', count: 2 },
      { label: '社区讨论', meta: 'Community / forum', count: 1 },
    ],
  },
};

const geoModelOrder: GeoModelKey[] = ['chatgpt', 'gemini', 'perplexity'];

const geoTasks = [
  { title: '补充材质、尺寸与容量字段', detail: '把城市通勤问题需要的产品事实写进英文产品页。', tag: '产品事实' },
  { title: '增加一段通勤与短途场景说明', detail: '让不同问题都能找到对应的使用场景。', tag: '场景内容' },
  { title: '整理可引用的比较信息', detail: '为包体、肩带与收纳结构准备清楚的事实段落。', tag: '内容结构' },
];

function GeoPromptRow({ prompt, expanded, onToggle }: { prompt: GeoPrompt; expanded: boolean; onToggle: () => void; key?: React.Key }) {
  const detailId = `li-prompt-detail-${prompt.id}`;
  return (
    <div className={`li-prompt-row ${expanded ? 'li-prompt-row-expanded' : ''}`}>
      <button type="button" className="li-prompt-toggle" onClick={onToggle} aria-expanded={expanded} aria-controls={detailId}>
        <span className="li-prompt-index" aria-hidden="true">{prompt.id.slice(-1).padStart(2, '0')}</span>
        <span className="li-prompt-copy"><strong>{prompt.question}</strong><span className={`li-prompt-status li-prompt-status-${prompt.status}`}>{prompt.status === 'mentioned' ? '已提及 · mentioned' : '未提及 · not mentioned'}</span></span>
        <span className="li-prompt-citations">引用 <b>{prompt.citations}</b></span>
        {expanded ? <ChevronUp size={17} aria-hidden="true" /> : <ChevronDown size={17} aria-hidden="true" />}
      </button>
      {expanded ? (
        <div className="li-prompt-detail" id={detailId}>
          <div className="li-answer-block">
            <p className="li-detail-label">示例回答摘录 · SYNTHETIC</p>
            <p className="li-detail-copy">{prompt.answer}</p>
          </div>
          <div className="li-detail-meta">
            <span className="li-detail-meta-item"><span>引用数</span><b>{prompt.citations}</b></span>
            <span className="li-detail-meta-item"><span>来源类别</span><b>{prompt.sourceCategory}</b></span>
          </div>
          <p className="li-detail-note">回答与来源均为模拟摘录，用于展示监测结果的阅读方式。</p>
        </div>
      ) : null}
    </div>
  );
}

export function GeoInsights() {
  const [activeModel, setActiveModel] = useState<GeoModelKey>('chatgpt');
  const [filter, setFilter] = useState<GeoFilter>('all');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const model = geoModels[activeModel];
  const mentionedCount = model.prompts.filter((prompt) => prompt.status === 'mentioned').length;
  const totalCitations = model.prompts.reduce((sum, prompt) => sum + prompt.citations, 0);
  const sourceCategoryCount = model.sourceMix.filter((source) => source.count > 0).length;
  const visiblePrompts = useMemo(
    () => model.prompts.filter((prompt) => filter === 'all' || prompt.status === filter),
    [filter, model],
  );
  const filterCounts: Record<GeoFilter, number> = {
    all: model.prompts.length,
    mentioned: mentionedCount,
    not_mentioned: model.prompts.length - mentionedCount,
  };

  const selectModel = (nextModel: GeoModelKey) => {
    setActiveModel(nextModel);
    setExpandedPrompt(null);
  };

  return (
    <div className="launch-insights li-geo" lang="zh-CN">
      <div className="li-page-header">
        <div className="li-heading-block">
          <PageKicker meta="GEO MONITORING">AI 搜索监测</PageKicker>
          <h2 className="li-page-title">品牌，如何出现在答案里。</h2>
          <p className="li-page-copy">用一组城市托特包问题，查看示例回答、提及状态和引用来源的结构。</p>
        </div>
        <div className="li-header-meta">
          <span className="li-disclaimer-pill">{GEO_DISCLAIMER}</span>
          <span className="li-period">6 个问题 · CITY CARRY / SAMPLE</span>
        </div>
      </div>

      <div className="li-model-switcher" role="group" aria-label="选择示例 AI 模型">
        {geoModelOrder.map((modelKey) => {
          const option = geoModels[modelKey];
          const optionMentioned = option.prompts.filter((prompt) => prompt.status === 'mentioned').length;
          return (
            <button type="button" key={modelKey} className={`li-model-button ${activeModel === modelKey ? 'li-model-button-active' : ''}`} onClick={() => selectModel(modelKey)} aria-pressed={activeModel === modelKey}>
              <span className="li-model-logo" aria-hidden="true">{option.short}</span>
              <span className="li-model-copy"><strong>{option.name}</strong><small>{option.meta}</small></span>
              <span className="li-model-count"><b>{optionMentioned}/{option.prompts.length}</b><small>提及</small></span>
            </button>
          );
        })}
      </div>

      <div className="li-metric-strip li-geo-metric-strip" aria-label={`${model.name} 示例监测指标`}>
        <InsightMetric label="提及 / MENTIONED" value={`${mentionedCount}/${model.prompts.length}`} detail="示例问题中出现品牌" accent />
        <InsightMetric label="覆盖率 / COVERAGE" value={`${Math.round((mentionedCount / model.prompts.length) * 100)}%`} detail="按示例问题计算" />
        <InsightMetric label="引用 / CITATIONS" value={formatInteger(totalCitations)} detail="示例引用计数" />
        <InsightMetric label="来源类别 / SOURCES" value={formatInteger(sourceCategoryCount)} detail="有引用的类别" />
      </div>

      <section className="li-panel li-model-panel" aria-labelledby="li-model-snapshot-title">
        <PanelHeading label="MODEL SNAPSHOT" title={`${model.name} · 示例快照`} titleId="li-model-snapshot-title" icon={<Globe2 size={20} aria-hidden="true" />} aside={<span className="li-panel-aside-meta">{GEO_DISCLAIMER}</span>} />
        <div className="li-model-table" role="table" aria-label="示例模型监测快照">
          <div className="li-model-table-head" role="row"><span role="columnheader">模型</span><span role="columnheader">提及</span><span role="columnheader">引用</span><span role="columnheader">样本状态</span></div>
          {geoModelOrder.map((modelKey) => {
            const rowModel = geoModels[modelKey];
            const rowMentioned = rowModel.prompts.filter((prompt) => prompt.status === 'mentioned').length;
            const rowCitations = rowModel.prompts.reduce((sum, prompt) => sum + prompt.citations, 0);
            return (
              <div className={`li-model-row ${activeModel === modelKey ? 'li-model-row-active' : ''}`} key={modelKey} role="row" aria-current={activeModel === modelKey ? 'true' : undefined}>
                <span className="li-model-name" role="cell"><span className="li-model-symbol" aria-hidden="true">{rowModel.short}</span><span><strong>{rowModel.name}</strong><small>{rowModel.meta}</small></span></span>
                <span className="li-model-stat" role="cell"><b>{rowMentioned}/{rowModel.prompts.length}</b><small>问题</small></span>
                <span className="li-model-stat" role="cell"><b>{rowCitations}</b><small>条引用</small></span>
                <span className="li-model-state" role="cell">{activeModel === modelKey ? '正在查看' : '已采样'}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="li-panel li-prompt-panel" aria-labelledby="li-prompt-title">
        <div className="li-panel-heading li-prompt-heading">
          <div><p className="li-panel-label">PROMPT MONITOR</p><h3 id="li-prompt-title" className="li-panel-title">示例问题与回答状态</h3></div>
          <span className="li-panel-aside-meta">{model.name} · {model.prompts.length} prompts</span>
        </div>
        <div className="li-filter-row" role="group" aria-label="筛选示例问题">
          {(['all', 'mentioned', 'not_mentioned'] as GeoFilter[]).map((filterKey) => {
            const label = filterKey === 'all' ? '全部' : filterKey === 'mentioned' ? '已提及' : '未提及';
            return <button type="button" key={filterKey} className={`li-filter-button ${filter === filterKey ? 'li-filter-button-active' : ''}`} onClick={() => setFilter(filterKey)} aria-pressed={filter === filterKey}>{label} <span>{filterCounts[filterKey]}</span></button>;
          })}
        </div>
        <div className="li-prompt-list">
          {visiblePrompts.length ? visiblePrompts.map((prompt) => <GeoPromptRow key={prompt.id} prompt={prompt} expanded={expandedPrompt === prompt.id} onToggle={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)} />) : (
            <div className="li-empty-state"><SearchX size={20} aria-hidden="true" /><strong>这个筛选暂时没有示例问题</strong><p>换一个筛选条件，继续查看当前模型的示例监测。</p></div>
          )}
        </div>
      </section>

      <div className="li-geo-lower-grid">
        <section className="li-panel li-source-panel" aria-labelledby="li-source-title">
          <PanelHeading label="SOURCE MIX" title="引用来源类别" titleId="li-source-title" icon={<Target size={20} aria-hidden="true" />} />
          <p className="li-panel-copy">当前模型的 {totalCitations} 条示例引用，按来源类别拆分。</p>
          <div className="li-source-list">
            {model.sourceMix.map((source) => {
              const percentage = totalCitations ? Math.round((source.count / totalCitations) * 100) : 0;
              return (
                <div className="li-source-row" key={source.label}>
                  <div className="li-source-copy"><strong>{source.label}</strong><small>{source.meta}</small></div>
                  <div className="li-source-bar" aria-label={`${source.label} ${percentage}%`}><span style={{ width: `${percentage}%` }} /></div>
                  <div className="li-source-stat"><b>{source.count}</b><span>{percentage}%</span></div>
                </div>
              );
            })}
          </div>
          <p className="li-panel-footnote">来源分类为模拟标签；没有连接真实网页或搜索结果。</p>
        </section>

        <section className="li-panel li-task-panel" aria-labelledby="li-task-title">
          <PanelHeading label="IMPROVEMENT TASKS" title="下一步内容任务" titleId="li-task-title" icon={<Lightbulb size={20} aria-hidden="true" />} />
          <p className="li-panel-copy">根据 {model.name} 的示例观察，整理三项可执行内容检查。</p>
          <div className="li-task-list">
            {geoTasks.map((task, index) => (
              <div className="li-task-row" key={task.title}>
                <span className="li-task-index">0{index + 1}</span>
                <span className="li-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                <span className="li-task-pill">{task.tag}</span>
              </div>
            ))}
          </div>
          <div className="li-footer-note"><CircleAlert size={16} aria-hidden="true" /><span>{GEO_DISCLAIMER}</span></div>
        </section>
      </div>
    </div>
  );
}
