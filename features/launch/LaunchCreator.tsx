import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock3, Instagram, Package, Play, RotateCcw, Send, Wallet, X } from 'lucide-react';
import { LAUNCH_ASSET_PATH, LAUNCH_BASE_PATH, LAUNCH_DEMO_PATH, LAUNCH_BRAND } from './config';
import { advanceCreatorStage, CreatorStage, creatorStages, validHttpsUrl, validInstagramHandle, validInstagramPost } from './creatorModel';
import './creator.css';

const stageCopy: Record<CreatorStage, { eyebrow: string; title: string; body: string }> = {
  brief: { eyebrow: 'A NEW PERSPECTIVE ON THE EVERYDAY', title: 'Take it\nsomewhere.', body: 'A city walk. Your favorite coffee spot. The things you carry along the way. Show us how the NORTHLINE City Carry fits into a day that’s yours.' },
  applied: { eyebrow: 'APPLICATION RECEIVED · DEMO', title: 'You’re on\nthe list.', body: 'Your sample application is ready for review. In a real project, the team would confirm the fit, the fee and the scope with you here.' },
  accepted: { eyebrow: 'COLLABORATION CONFIRMED · DEMO', title: 'Good things\nare on the way.', body: 'Your sample is in transit. This is where you’ll find delivery updates and everything you need to start creating.' },
  received: { eyebrow: 'TIME TO MAKE IT YOURS', title: 'Your take.\nYour first cut.', body: 'Keep it natural. Show the details you actually notice, and let the product be part of your day.' },
  submitted: { eyebrow: 'DRAFT RECEIVED · DEMO', title: 'Over to\nthe brand.', body: 'Your first cut is in review. Feedback and approval stay together here, so you always know which version is ready to post.' },
  approved: { eyebrow: 'APPROVED TO POST · DEMO', title: 'Ready for\nthe real world.', body: 'Your draft is approved in this sample workflow. Add the published Instagram link to complete delivery.' },
  posted: { eyebrow: 'DELIVERY COMPLETE · DEMO', title: 'You made\nit happen.', body: 'The published link is recorded in this demo. In a live project, the team would verify the post and arrange your agreed payment.' },
  paid: { eyebrow: 'PROJECT COMPLETE · DEMO', title: 'Here’s to\nwhat’s next.', body: 'From the first brief to the final delivery, everything is in one place. This is the end of the sample creator journey.' },
};

export default function LaunchCreator() {
  const [stage, setStage] = useState<CreatorStage>('brief');
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [note, setNote] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [draft, setDraft] = useState('');
  const [post, setPost] = useState('');
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const handleInput = useRef<HTMLInputElement>(null);
  const c = stageCopy[stage];
  const stageIndex = creatorStages.indexOf(stage);

  useEffect(() => { const title = document.title; document.title = 'Creator brief — hOpOn Launch'; return () => { document.title = title; }; }, []);
  useEffect(() => { if (applicationOpen) handleInput.current?.focus(); }, [applicationOpen]);
  const advance = (next: CreatorStage) => { setStage(current => advanceCreatorStage(current, next)); setError(''); setApplicationOpen(false); requestAnimationFrame(() => heading.current?.focus()); };
  const reset = () => { setStage('brief'); setApplicationOpen(false); setHandle(''); setPortfolio(''); setNote(''); setAcknowledged(false); setDraft(''); setPost(''); setError(''); };
  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validInstagramHandle(handle)) return setError('Enter an Instagram handle using letters, numbers, dots or underscores.');
    if (!validHttpsUrl(portfolio)) return setError('Add a full portfolio link starting with https://.');
    if (!acknowledged) return setError('Please review the sample deliverables and usage terms below.');
    advance('applied');
  };
  const submitLink = (event: React.FormEvent, kind: 'draft' | 'post') => {
    event.preventDefault();
    if (kind === 'draft' && !validHttpsUrl(draft)) return setError('Add a full review link starting with https://.');
    if (kind === 'post' && !validInstagramPost(post)) return setError('Use an Instagram post or Reel link, such as https://www.instagram.com/reel/sample/.');
    advance(kind === 'draft' ? 'submitted' : 'posted');
  };

  return <div className="launch-creator-app" lang="en">
    <a className="lc-skip" href="#creator-task">Skip to task</a>
    <header className="lc-header"><Link className="lc-wordmark" to={LAUNCH_BASE_PATH}>{LAUNCH_BRAND.name} <i>/</i> <b>{LAUNCH_BRAND.label}</b></Link><span>CREATOR SPACE</span><Link to={LAUNCH_DEMO_PATH}>Brand view <ArrowUpRight size={16}/></Link></header>
    <div className="lc-demo-strip"><span><i/>CREATOR PREVIEW</span><p>Fictional project. Actions stay on this page. No applications, uploads or payments are sent.</p><button onClick={reset}><RotateCcw size={14}/>Reset</button></div>
    <main id="creator-task" className="lc-main">
      <div className="lc-topline"><Link to={LAUNCH_BASE_PATH}><ArrowLeft size={16}/> Back to Launch</Link><span>NORTHLINE / CITY CARRY / 001</span></div>
      <div className="lc-layout">
        <div className="lc-main-column">
          <div className="lc-eyebrow"><Instagram size={15}/>{c.eyebrow}</div>
          <h1 ref={heading} tabIndex={-1}>{c.title.split('\n').map(line => <span key={line}>{line}</span>)}</h1>
          <p className="lc-intro">{c.body}</p>
          <div className="lc-pills"><span><Instagram size={14}/>Instagram Reel</span><span>Everyday style</span><span>North America</span></div>

          {stage === 'brief' && <>
            <div className="lc-editorial"><img src={`${LAUNCH_ASSET_PATH}/hero.webp`} alt="Original editorial concept showing a red city tote" width="1536" height="1024"/><span>THE CITY CARRY EDIT <ArrowUpRight size={22}/></span><small>AI-generated concept imagery · fictional product</small></div>
            <section className="lc-brief-section"><span className="lc-label">THE IDEA</span><h2>Built around your day.</h2><p>Introduce the City Carry through a short, personal story. A real setting, thoughtful details, and your own voice. The creative direction is everyday style, with a focus on how you use the bag.</p><div className="lc-direction-grid"><div><b>Show</b><span>Your routine, the details, what’s inside.</span></div><div><b>Feel</b><span>Natural light. Clean framing. Your pace.</span></div><div><b>Say</b><span>Your honest experience, in your words.</span></div></div></section>
          </>}

          {stage === 'applied' && <section className="lc-stage-card"><span className="lc-stage-icon"><CheckCircle2/></span><h2>A clear next step.</h2><p>Your profile <strong>@{handle.replace(/^@/, '')}</strong> has been added to this sample application.</p><div className="lc-record"><span>Application</span><b>In review</b></div><div className="lc-record"><span>Deliverables</span><b>1 Reel + clean export</b></div><div className="lc-simulation"><span>CONTINUE THE DEMO</span><p>Preview what an accepted collaboration looks like.</p><button className="lc-primary" onClick={() => advance('accepted')}>Simulate acceptance <ArrowRight size={17}/></button></div></section>}

          {stage === 'accepted' && <section className="lc-stage-card"><span className="lc-stage-icon"><Package/></span><h2>Your product, on its way.</h2><div className="lc-record"><span>Sample</span><b>City Carry / Red</b></div><div className="lc-record"><span>Delivery</span><b>In transit · sample status</b></div><div className="lc-record"><span>First draft</span><b>7 days after receipt</b></div><p className="lc-muted">There is no real shipment or tracking number in this preview.</p><button className="lc-primary" onClick={() => advance('received')}>Mark sample received <Check size={17}/></button></section>}

          {stage === 'received' && <section className="lc-stage-card"><span className="lc-stage-icon"><Play/></span><h2>Share your first cut.</h2><p>In a live collaboration, your review link brings the video and the brand’s feedback together.</p><form onSubmit={event => submitLink(event, 'draft')} noValidate><label htmlFor="lc-draft">Draft review link</label><input id="lc-draft" type="url" value={draft} onChange={e => { setDraft(e.target.value); setError(''); }} placeholder="https://example.com/my-first-cut" aria-invalid={!!error} aria-describedby={error ? 'lc-error' : 'lc-link-help'}/><span id="lc-link-help" className="lc-field-help">Demo only. The link will not be opened or uploaded.</span><button type="button" className="lc-inline-button" onClick={() => { setDraft('https://example.com/city-carry-draft'); setError(''); }}>Use a sample link</button>{error && <p id="lc-error" className="lc-error" role="alert">{error}</p>}<button className="lc-primary" type="submit">Submit draft in demo <ArrowRight size={17}/></button></form></section>}

          {stage === 'submitted' && <section className="lc-stage-card"><span className="lc-stage-icon"><Clock3/></span><h2>One place for feedback.</h2><div className="lc-review-preview"><span className="lc-review-avatar">N</span><div><b>NORTHLINE team</b><p>Draft received. A live project would show timestamped feedback and any revision requests here.</p></div></div><div className="lc-record"><span>Version</span><b>01 · In review</b></div><div className="lc-simulation"><span>CONTINUE THE DEMO</span><p>Move to the approved version to preview delivery.</p><button className="lc-primary" onClick={() => advance('approved')}>Simulate brand approval <ArrowRight size={17}/></button></div></section>}

          {stage === 'approved' && <section className="lc-stage-card"><span className="lc-stage-icon"><Send/></span><h2>Complete the delivery.</h2><div className="lc-approval-note"><CheckCircle2 size={18}/><span>Version 01 approved · sample decision</span></div><form onSubmit={event => submitLink(event, 'post')} noValidate><label htmlFor="lc-post">Published Instagram link</label><input id="lc-post" type="url" value={post} onChange={e => { setPost(e.target.value); setError(''); }} placeholder="https://www.instagram.com/reel/…" aria-invalid={!!error} aria-describedby={error ? 'lc-error' : 'lc-post-help'}/><span className="lc-field-help" id="lc-post-help">Use the sample link to try the flow without posting anything.</span><button type="button" className="lc-inline-button" onClick={() => { setPost('https://www.instagram.com/reel/sample/'); setError(''); }}>Use a sample link</button>{error && <p id="lc-error" className="lc-error" role="alert">{error}</p>}<button className="lc-primary" type="submit">Record delivery in demo <ArrowRight size={17}/></button></form></section>}

          {stage === 'posted' && <section className="lc-stage-card"><span className="lc-stage-icon"><Wallet/></span><h2>Delivery, recorded.</h2><div className="lc-record"><span>Content</span><b>1 Instagram Reel</b></div><div className="lc-record"><span>Illustrative creator fee</span><b>$450 USD</b></div><div className="lc-record"><span>Payment</span><b>Pending · demo status</b></div><div className="lc-simulation"><span>CONTINUE THE DEMO</span><p>Preview a completed project. No money will move.</p><button className="lc-primary" onClick={() => advance('paid')}>Simulate payment completion <ArrowRight size={17}/></button></div></section>}

          {stage === 'paid' && <section className="lc-stage-card lc-complete"><span className="lc-stage-icon"><CheckCircle2/></span><h2>One good collaboration.<br/>More to come.</h2><p>Content delivered. Sample payment marked complete. Your project history is ready for the next opportunity.</p><div className="lc-receipt"><span>SAMPLE RECEIPT — NO TRANSACTION</span><b>$450<small>USD</small></b><span>City Carry / 1 Reel + clean export</span></div><Link className="lc-primary" to={LAUNCH_DEMO_PATH}>See the brand workspace <ArrowUpRight size={17}/></Link><button className="lc-inline-button" onClick={reset}>Restart the creator journey</button></section>}

          <section className="lc-details" aria-label="Project details"><details open><summary>Deliverables <span>01</span></summary><div><p>One 20–35 second vertical Instagram Reel, an approved caption and one clean video export.</p><p>First draft within 7 days of receiving the sample. One consolidated revision round is included in this illustrative brief.</p></div></details><details><summary>Usage & creative scope <span>02</span></summary><div><p>Sample scope: 90 days of organic use on the brand’s owned social accounts and website. Paid advertising, partnership ads and exclusivity are separate items to agree before production.</p><p>Share your real experience and clearly disclose the paid collaboration. Final terms belong in the project agreement.</p></div></details><details><summary>Payment & support <span>03</span></summary><div><p>$450 USD is an illustrative creator fee for this fictional brief, not a live offer. In a real project, the fee and payment timing are confirmed before work starts.</p><p>The project team coordinates the sample, feedback and delivery through your workspace.</p></div></details></section>
        </div>

        <aside className="lc-aside">
          <div className="lc-summary-card"><div className="lc-summary-brand"><span>N.</span><div><b>NORTHLINE</b><small>Fictional lifestyle brand</small></div></div><hr/><span className="lc-label">THE COLLABORATION</span><h2>City Carry.<br/>Your everyday edit.</h2><div className="lc-fee"><strong>$450</strong><span>USD<br/>Illustrative creator fee</span></div><ul><li><Check size={15}/>1 Instagram Reel + clean export</li><li><Check size={15}/>Sample product included</li><li><Check size={15}/>1 consolidated revision round</li></ul>
            {stage === 'brief' && !applicationOpen && <><button className="lc-primary" onClick={() => { setApplicationOpen(true); setError(''); }}>Try the application <ArrowUpRight size={17}/></button><p className="lc-no-send">A sample application. Nothing is sent.</p></>}
            {stage === 'brief' && applicationOpen && <form className="lc-application" onSubmit={apply} noValidate><div className="lc-form-heading"><b>Your introduction</b><button type="button" aria-label="Close application" onClick={() => { setApplicationOpen(false); setError(''); }}><X size={18}/></button></div><label htmlFor="lc-handle">Instagram handle</label><input ref={handleInput} id="lc-handle" value={handle} onChange={e => { setHandle(e.target.value); setError(''); }} placeholder="@yourname" autoComplete="off" maxLength={31}/><label htmlFor="lc-portfolio">Portfolio link</label><input id="lc-portfolio" type="url" value={portfolio} onChange={e => { setPortfolio(e.target.value); setError(''); }} placeholder="https://yourportfolio.com"/><label htmlFor="lc-note">Your angle <span>(optional)</span></label><textarea id="lc-note" value={note} onChange={e => setNote(e.target.value)} maxLength={500} rows={3} placeholder="How would you make this your own?"/><label className="lc-checkbox"><input type="checkbox" checked={acknowledged} onChange={e => { setAcknowledged(e.target.checked); setError(''); }}/><span>I’ve reviewed the sample deliverables and usage scope.</span></label><button type="button" className="lc-inline-button" onClick={() => { setHandle('@sample.creator'); setPortfolio('https://example.com/portfolio'); setAcknowledged(true); setError(''); }}>Fill with sample details</button>{error && <p id="lc-error" role="alert" className="lc-error">{error}</p>}<button type="submit" className="lc-primary">Submit in demo <ArrowRight size={17}/></button><p className="lc-no-send">Only stored until you leave or reset this page.</p></form>}
            {stage !== 'brief' && <div className="lc-status"><span/><b>{stage === 'paid' ? 'Completed · demo' : 'Your project is moving'}</b></div>}
          </div>
          <div className="lc-journey"><span className="lc-label">YOUR JOURNEY</span><ol>{[['Apply', 1], ['Confirm & receive sample', 3], ['Create & review', 5], ['Publish & get paid', 7]].map(([label, threshold], index) => <li className={stageIndex >= Number(threshold) ? 'is-complete' : stageIndex >= Number(threshold) - (index === 0 ? 1 : 2) ? 'is-current' : ''} key={label}><span>{stageIndex >= Number(threshold) ? <Check size={12}/> : `0${index + 1}`}</span><b>{label}</b></li>)}</ol></div>
        </aside>
      </div>
    </main>
    <footer className="lc-footer"><Link to={LAUNCH_BASE_PATH}>{LAUNCH_BRAND.name} / {LAUNCH_BRAND.label}</Link><span>Your perspective. A world of brands.</span><span>CONCEPT DEMO · 2026</span></footer>
  </div>;
}
