import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, ArrowRight, Check, Plus, Minus, Menu, X, Instagram, Globe2, Play, MoveUpRight } from 'lucide-react';
import { LAUNCH_BASE_PATH, LAUNCH_DEMO_PATH, LAUNCH_ASSET_PATH, LAUNCH_BRAND } from './config';
import './launch.css';

const copy = {
  en: {
    nav: ['Approach', 'For brands', 'For creators'], cta: 'Explore the demo',
    eyebrow: 'GREAT PRODUCTS DESERVE A BIGGER WORLD', title: ['Good brands.', 'New worlds.'],
    intro: 'Your next chapter starts with the right people. We connect ambitious brands with North American creators — and turn their stories into lasting discovery.',
    heroCta: 'See how it works', secondary: 'Meet your next market',
    caption: 'REAL PERSPECTIVES. NEW POSSIBILITIES.', captionSub: 'Creator-led content, made for the way people discover.',
    approachTitle: ['Make an entrance.', 'Build a presence.'],
    approachBody: 'One team, from the first brief to the next campaign. You bring a product worth knowing. We bring the people, the content, and a clear plan to get it there.',
    services: [
      { name: 'Creator partnerships', sub: 'THE PEOPLE BEHIND THE STORY', body: 'Paid Instagram partnerships, thoughtful casting, clear briefs and hands-on production. Every collaboration starts with your brand.', items: ['Creator curation & casting', 'Briefs, samples & production', 'Content review & usage rights'] },
      { name: 'AI discovery', sub: 'THE INFORMATION BEHIND THE ANSWER', body: 'Clear product stories, useful answers and a stronger website. We help your brand show up accurately where your next customer is looking.', items: ['Product & content foundations', 'GEO baselines & source analysis', 'Website content & ongoing updates'] },
    ],
    processKicker: 'A CLEAR WAY FORWARD', processTitle: 'A little less back-and-forth.\nA lot more getting there.',
    steps: [['01', 'Set the direction', 'Product, audience, deliverables. One brief everyone can work from.'], ['02', 'Find your people', 'We recruit and curate. You confirm the creators and the scope.'], ['03', 'Make something good', 'Samples, production, feedback and approvals in one shared place.'], ['04', 'Put it to work', 'Publish, reuse the content and review what happened next.']],
    workspaceKicker: 'YOUR BRAND. YOUR WORKSPACE.', workspaceTitle: ['The whole picture.', 'Always in view.'], workspaceBody: 'Know what’s moving, what needs your approval, and what’s ready to use. A shared workspace with a real team behind it.', workspaceCta: 'Open the interactive demo',
    creatorKicker: 'FOR THE PEOPLE WHO MAKE THINGS MATTER', creatorTitle: ['Your point of view.', 'A world of brands.'], creatorBody: 'Bring your taste, your curiosity, your real experience. Discover paid collaborations with products ready for their next chapter.', creatorCta: 'Preview a creator brief',
    closing: ['Let’s take your brand', 'somewhere new.'], closingCta: 'Explore a brand project',
    faqTitle: 'A few things, answered.', faqs: [['Do I need to find the creators myself?', 'We manage recruitment and coordination. You review a curated shortlist, agree on the scope, and give feedback at the important moments.'], ['Can I book creator work and GEO separately?', 'Yes. Creator campaigns and GEO / website content have their own deliverables. They can also be combined around the same product and customer questions.'], ['What can I do in this demo?', 'Explore a fictional brand project, select sample creators, review content and inspect a project report. Actions stay in the demo; no messages are sent and no payments are made.']],
    footer: 'Good brands travel well.', demo: 'CONCEPT DEMO', photo: 'Editorial concept imagery',
  },
  zh: {
    nav: ['合作方式', '品牌服务', '创作者'], cta: '体验 Demo',
    eyebrow: '让好产品，被更大的世界看见', title: ['好品牌，', '新世界。'],
    intro: '与北美创作者一起，把产品讲给新的人听。从付费合作、内容制作，到独立站与 AI 搜索中的品牌呈现，我们负责推进，你看得见每一步。',
    heroCta: '体验合作流程', secondary: '走进你的下一个市场',
    caption: '真实的视角，新的可能。', captionSub: '以创作者内容，连接品牌与新的消费者。',
    approachTitle: ['让人第一次看见，', '也让人持续找到。'],
    approachBody: '从第一份 brief 到下一轮合作，由同一支团队负责。你带来值得了解的产品，我们把招募、内容与交付安排清楚。',
    services: [
      { name: '创作者合作', sub: '让合适的人，讲好产品', body: '聚焦 Instagram 付费合作。从人选、报价、寄样到审稿和授权，围绕品牌需求完成每一次交付。', items: ['垂类创作者招募与筛选', '任务、寄样与内容制作', '审核、发布与素材授权'] },
      { name: 'AI 搜索与品牌内容', sub: '让产品信息，成为有用的答案', body: '把产品事实和真实体验，整理成清楚的英文页面与购买指南，持续观察搜索及 AI 答案中的品牌呈现。', items: ['产品资料与内容基础', 'GEO 基线与引用来源分析', '独立站内容与持续更新'] },
    ],
    processKicker: '让合作有清楚的下一步', processTitle: '少一些来回沟通，\n多一些实际推进。',
    steps: [['01', '确定方向', '明确产品、目标消费者和交付范围，形成共同的 brief。'], ['02', '找到合适的人', '我们招募并筛选，你确认人选、报价和合作内容。'], ['03', '完成好内容', '寄样、制作、反馈与审核，集中在一个项目里推进。'], ['04', '让内容发挥价值', '完成发布与素材交付，再一起看结果和下一轮机会。']],
    workspaceKicker: '品牌与项目，都有自己的空间', workspaceTitle: ['进度与成果，', '随时看得见。'], workspaceBody: '哪些在推进，哪些等你确认，哪些内容已经能用。团队负责执行，平台让合作始终清楚。', workspaceCta: '打开交互 Demo',
    creatorKicker: '给有自己视角的创作者', creatorTitle: ['你的真实体验，', '品牌的新篇章。'], creatorBody: '带着你的审美、好奇心和真实体验，参与有明确报酬与要求的品牌合作。', creatorCta: '查看创作者任务示例',
    closing: ['把你的品牌，', '带到新的地方。'], closingCta: '体验品牌项目',
    faqTitle: '你可能想知道。', faqs: [['需要我自己去找创作者吗？', '我们负责招募、筛选和沟通。你在关键节点确认人选、合作范围和内容，其余流程由团队推进。'], ['创作者合作和 GEO 可以单独购买吗？', '可以。两项服务有独立的交付范围，也可以围绕同一产品与消费者问题组合开展。'], ['这个 Demo 可以体验什么？', '你可以进入一个虚构品牌项目，选择示例创作者、审核内容和查看项目报告。操作只影响演示，不会发送消息或产生付款。']],
    footer: '好品牌，值得走得更远。', demo: '概念演示', photo: '原创概念影像',
  },
};

export default function LaunchLanding() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [paused, setPaused] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const previous = document.title;
    document.title = 'hOpOn Launch — Good brands. New worlds.';
    return () => { document.title = previous; };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  return <div className="launch-site" lang={language === 'en' ? 'en' : 'zh-CN'}>
    <a className="launch-skip" href="#launch-content">{language === 'en' ? 'Skip to content' : '跳至正文'}</a>
    <header className="launch-header">
      <Link to={LAUNCH_BASE_PATH} className="launch-wordmark" aria-label="hOpOn Launch"><span>{LAUNCH_BRAND.name}</span><i>/</i><b>{LAUNCH_BRAND.label}</b></Link>
      <nav className="launch-desktop-nav" aria-label={language === 'en' ? 'Main navigation' : '主导航'}>
        {['approach', 'brands', 'creators'].map((id, index) => <a key={id} href={`#launch-${id}`}>{t.nav[index]}</a>)}
      </nav>
      <div className="launch-header-actions">
        <button className="launch-language" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} aria-label={language === 'en' ? '切换为中文' : 'Switch to English'}>{language === 'en' ? '中文' : 'EN'}</button>
        <Link className="launch-button launch-button-small" to={LAUNCH_DEMO_PATH}>{t.cta}<ArrowUpRight size={16}/></Link>
        <button className="launch-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="launch-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      </div>
      {menuOpen && <nav id="launch-mobile-nav" className="launch-mobile-nav" aria-label="Mobile navigation">{['approach', 'brands', 'creators'].map((id, index) => <a key={id} href={`#launch-${id}`} onClick={() => setMenuOpen(false)}>{t.nav[index]}<ArrowUpRight size={18}/></a>)}</nav>}
    </header>

    <main id="launch-content">
      <section className="launch-hero">
        <div className="launch-hero-top"><span className="launch-eyebrow"><i/>{t.eyebrow}</span><span className="launch-edition">CN → NORTH AMERICA &nbsp; / &nbsp; 01</span></div>
        <div className="launch-hero-heading"><h1><span>{t.title[0]}</span><span>{t.title[1]}<span className="launch-period">↗</span></span></h1><div className="launch-hero-intro"><p>{t.intro}</p><Link className="launch-text-link" to={LAUNCH_DEMO_PATH}>{t.heroCta}<ArrowUpRight size={23}/></Link></div></div>
        <div className="launch-hero-media">
          <img src={`${LAUNCH_ASSET_PATH}/hero.webp`} alt={language === 'en' ? 'Editorial concept: a creator with a red tote in the city' : '原创概念影像：携带红色包袋的城市创作者'} width="1536" height="1024" fetchPriority="high"/>
          <div className="launch-media-index"><span>01 — NEW PERSPECTIVES</span><span>{t.photo}</span></div>
          <div className="launch-media-label"><Instagram size={20}/><span>{t.caption}</span></div>
          <a className="launch-media-scroll" href="#launch-approach" aria-label={language === 'en' ? 'Explore our approach' : '了解合作方式'}><ArrowDown/></a>
        </div>
        <div className="launch-hero-bottom"><span>{t.captionSub}</span><span>CREATORS × CONTENT × DISCOVERY</span></div>
      </section>

      <section id="launch-approach" className="launch-approach launch-section">
        <div className="launch-section-marker"><span>(01)</span><span>{language === 'en' ? 'OUR APPROACH' : '我们的方式'}</span></div>
        <div className="launch-approach-copy"><h2>{t.approachTitle[0]}<br/><span>{t.approachTitle[1]}</span></h2><p>{t.approachBody}</p></div>
      </section>

      <div className="launch-category-band" aria-label={language === 'en' ? 'Consumer brand categories' : '消费品牌品类'}>
        <div className={`launch-category-track ${paused ? 'is-paused' : ''}`}><div>{['FASHION', 'BEAUTY', 'EVERYDAY OBJECTS', 'WELLNESS', 'LIFE OUTSIDE'].map((s, i) => <span key={s} className={`launch-category-${i}`}>{s}<i>✳</i></span>)}</div><div aria-hidden="true">{['FASHION', 'BEAUTY', 'EVERYDAY OBJECTS', 'WELLNESS', 'LIFE OUTSIDE'].map((s, i) => <span key={s} className={`launch-category-${i}`}>{s}<i>✳</i></span>)}</div></div>
        <button onClick={() => setPaused(!paused)} className="launch-motion-toggle" aria-label={paused ? 'Resume category motion' : 'Pause category motion'} aria-pressed={paused}>{paused ? <Play size={14}/> : <span aria-hidden="true">Ⅱ</span>}</button>
      </div>

      <section id="launch-brands" className="launch-services launch-section">
        <div className="launch-section-marker"><span>(02)</span><span>{language === 'en' ? 'TWO WAYS TO GO FURTHER' : '两项服务，一个合作团队'}</span></div>
        <div className="launch-services-grid">{t.services.map((service, index) => <article className="launch-service" key={service.name}>
          <div className="launch-service-top"><span className="launch-service-number">0{index + 1}</span>{index === 0 ? <Instagram size={27}/> : <Globe2 size={29}/>}</div>
          <span className="launch-eyebrow">{service.sub}</span><h3>{service.name}</h3><p>{service.body}</p>
          <ul>{service.items.map(item => <li key={item}><Check size={15}/>{item}</li>)}</ul>
          <Link className="launch-service-link" to={`${LAUNCH_DEMO_PATH}${index === 1 ? '?view=geo' : '?view=creators'}`} aria-label={`${t.cta}: ${service.name}`}><span>{t.cta}</span><ArrowUpRight/></Link>
        </article>)}</div>
      </section>

      <section className="launch-process launch-section">
        <div className="launch-section-marker"><span>(03)</span><span>{t.processKicker}</span></div>
        <h2>{t.processTitle.split('\n').map(line => <span key={line}>{line}</span>)}</h2>
        <div className="launch-process-grid">{t.steps.map(([number, title, body]) => <article key={number}><span>{number}</span><div className="launch-process-line"/><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="launch-workspace-section launch-section">
        <div className="launch-workspace-copy"><span className="launch-eyebrow">{t.workspaceKicker}</span><h2>{t.workspaceTitle[0]}<br/><span>{t.workspaceTitle[1]}</span></h2><p>{t.workspaceBody}</p><Link className="launch-button" to={LAUNCH_DEMO_PATH}>{t.workspaceCta}<ArrowUpRight size={18}/></Link></div>
        <Link className="launch-project-preview" to={LAUNCH_DEMO_PATH} aria-label={t.workspaceCta}>
          <div className="launch-preview-top"><span className="launch-preview-dot"/>NORTHLINE<span>{language === 'en' ? 'Sample project' : '示例项目'}</span><ArrowUpRight size={16}/></div>
          <div className="launch-preview-content"><span className="launch-eyebrow">INSTAGRAM · CITY CARRY</span><h3>The everyday,<br/>reimagined.</h3><div className="launch-preview-progress"><span/><span/><span/><span/></div><div className="launch-preview-progress-label"><span>{language === 'en' ? 'Production in progress' : '内容制作中'}</span><span>03 / 04</span></div><div className="launch-preview-task"><div className="launch-preview-avatar">A</div><div><b>{language === 'en' ? 'Creator shortlist' : '创作者候选名单'}</b><small>{language === 'en' ? 'Ready for your review' : '等待你的确认'}</small></div><span className="launch-preview-review">{language === 'en' ? 'Review' : '查看'}</span></div><div className="launch-preview-task"><div className="launch-preview-avatar muted"><Play size={16}/></div><div><b>{language === 'en' ? 'First content draft' : '第一版内容'}</b><small>{language === 'en' ? 'One place for all your feedback' : '在同一个地方集中反馈'}</small></div><ArrowRight size={17}/></div></div>
          <div className="launch-preview-footer"><span>{language === 'en' ? 'An interactive project. All sample data.' : '可交互项目 · 全部为示例数据'}</span><MoveUpRight size={15}/></div>
        </Link>
      </section>

      <section id="launch-creators" className="launch-creator-section launch-section">
        <div className="launch-creator-art"><img src={`${LAUNCH_ASSET_PATH}/hero.webp`} alt={language === 'en' ? 'Editorial lifestyle creator concept' : '生活方式创作者概念影像'} loading="lazy" width="1536" height="1024"/><div className="launch-creator-overlay"><span>YOUR TASTE.</span><span>YOUR TAKE.</span></div><small>{t.photo}</small></div>
        <div className="launch-creator-copy"><span className="launch-eyebrow">{t.creatorKicker}</span><h2>{t.creatorTitle[0]}<br/><span>{t.creatorTitle[1]}</span></h2><p>{t.creatorBody}</p><Link className="launch-text-link" to={`${LAUNCH_BASE_PATH}/creator`}>{t.creatorCta}<ArrowUpRight size={21}/></Link><span className="launch-creator-note">PAID COLLABORATIONS / CLEAR BRIEFS / YOUR PERSPECTIVE</span></div>
      </section>

      <section className="launch-faq launch-section"><div className="launch-section-marker"><span>(04)</span><span>THE DETAILS</span></div><h2>{t.faqTitle}</h2><div>{t.faqs.map(([q, a], index) => <article key={index}><button aria-expanded={openFaq === index} aria-controls={`launch-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{q}{openFaq === index ? <Minus size={20}/> : <Plus size={20}/>}</button><div id={`launch-faq-${index}`} hidden={openFaq !== index}><p>{a}</p></div></article>)}</div></section>

      <section className="launch-closing launch-section"><div><span className="launch-eyebrow">NEXT STOP: WHAT’S NEXT.</span><h2>{t.closing[0]}<br/>{t.closing[1]}</h2><Link to={LAUNCH_DEMO_PATH} className="launch-button launch-button-white">{t.closingCta}<ArrowUpRight size={20}/></Link></div><ArrowUpRight className="launch-closing-arrow" strokeWidth={1}/></section>
    </main>
    <footer className="launch-footer"><Link to={LAUNCH_BASE_PATH} className="launch-wordmark"><span>{LAUNCH_BRAND.name}</span><i>/</i><b>{LAUNCH_BRAND.label}</b></Link><span>{t.footer}</span><div><span>{t.demo} · 2026</span><Link to="/">hOpOn <ArrowUpRight size={14}/></Link></div></footer>
  </div>;
}
