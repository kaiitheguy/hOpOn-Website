import { seedDemo, visibleState, instagramOnly, type DemoState, type Mode, type Creator } from './demo';

const DATABASE = 'hopon-florasis-public-demo-v1';
const media = new Map<string, string>();
const allowed: Record<Mode, string[]> = {
  brand: ['toggle', 'confirm', 'comment', 'approve', 'geo'],
  team: ['comment', 'version', 'publish', 'creator', 'brief', 'reset', 'geo'],
  creator: ['version', 'comment'],
};
let opening: Promise<IDBDatabase> | undefined;
function database() {
  if (!opening) opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('此浏览器不支持保存演示进度，请使用常规浏览器窗口。'));
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {request.result.createObjectStore('state'); request.result.createObjectStore('files');};
    request.onsuccess = () => {request.result.onversionchange = () => {request.result.close(); opening = undefined;}; resolve(request.result);};
    request.onerror = () => {opening = undefined; reject(new Error('无法打开浏览器存储，请允许网站保存数据后重试。'));};
    request.onblocked = () => {opening = undefined; reject(new Error('请关闭其他花西子演示标签后重试。'));};
  });
  return opening;
}
function failure(error?: DOMException | null) {
  return new Error(error?.name === 'QuotaExceededError' ? '浏览器空间不足，文件未保存。请换用较小文件或清理此演示的数据。' : '无法保存这次演示操作，请重试。');
}
function requestValue<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {request.onsuccess = () => resolve(request.result); request.onerror = () => reject(failure(request.error));});
}
async function populateMedia(state: DemoState) {
  const db = await database();
  const keys = [...new Set(state.drafts.flatMap(d => d.versions.flatMap(v => v.file ? [v.file.key] : [])))];
  await Promise.all(keys.filter(key => !media.has(key)).map(async key => {
    const value = await requestValue<Blob | undefined>(db.transaction('files').objectStore('files').get(key));
    if (value instanceof Blob) media.set(key, URL.createObjectURL(value));
  }));
}
function stateTransaction(update?: (state: DemoState) => DemoState, clearFiles = false) {
  return database().then(db => new Promise<DemoState>((resolve, reject) => {
    const transaction = db.transaction(['state', 'files'], 'readwrite');
    const store = transaction.objectStore('state');
    const read = store.get('campaign');
    let result: DemoState;
    let problem: Error | undefined;
    read.onsuccess = () => {
      try {
        const current = instagramOnly(read.result ?? seedDemo());
        result = update ? update(structuredClone(current)) : current;
        store.put(result, 'campaign');
        if (clearFiles) transaction.objectStore('files').clear();
      } catch (e) {problem = e instanceof Error ? e : new Error('操作失败。'); transaction.abort();}
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(problem ?? failure(transaction.error));
    transaction.onerror = () => reject(problem ?? failure(transaction.error));
  }));
}
export async function loadDemo(mode: Mode): Promise<DemoState> {
  const state = await stateTransaction();
  await populateMedia(state);
  return visibleState(state, mode);
}
const text = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 5000) : '';
function requireValue(condition: unknown, message: string): asserts condition {if (!condition) throw new Error(message);}

export async function mutateDemo(input: Record<string, unknown>): Promise<DemoState> {
  const mode = input.mode as Mode;
  const action = String(input.action ?? '');
  requireValue(allowed[mode]?.includes(action), '请切换到对应演示视角完成此操作。');
  const next = await stateTransaction(state => {
    requireValue(state.revision === input.revision, '项目已在另一标签页更新，请刷新项目后再试。');
    const at = new Date().toISOString();
    const creator = state.creators.find(c => c.id === input.id);
    const draft = state.drafts.find(d => d.id === input.id);
    const version = draft?.versions.at(-1);
    let event = '';
    if (action === 'toggle') {
      requireValue(creator && !creator.confirmed, '此人选已经确认或不可选。');
      creator.selected = !creator.selected;
      event = `品牌${creator.selected ? '暂选' : '取消暂选'}了 ${creator.name}`;
    }
    if (action === 'confirm') {
      const chosen = state.creators.filter(c => c.selected && !c.confirmed);
      requireValue(chosen.length, '请先选择新的候选博主。');
      requireValue(state.creators.filter(c => c.selected || c.confirmed).reduce((sum, c) => sum + c.quote, 0) <= 9600, '所选报价超出 $9,600 执行预算。');
      for (const c of chosen) {c.confirmed = true; c.stage = '待敲定合作'; state.drafts.push({id: `draft-${c.id}`, creatorId: c.id, versions: [], comments: [], published: false});}
      event = `品牌确认了 ${chosen.map(c => c.name).join('、')}，团队待敲定合作`;
    }
    if (action === 'comment') {
      requireValue(draft && version && !draft.published && text(input.text), '请填写反馈并选择未发布的内容。');
      draft.comments.push({id: crypto.randomUUID(), versionId: version.id, author: mode === 'brand' ? '品牌团队' : mode === 'team' ? 'William / hOpOn' : '创作者', text: text(input.text), at});
      if (mode === 'brand') version.status = 'changes';
      event = '新增了内容反馈';
    }
    if (action === 'approve') {
      requireValue(draft && version && !draft.published && version.status !== 'approved', '此版本无法重复确认。');
      version.status = 'approved'; event = `品牌通过了内容 v${version.number}`;
    }
    if (action === 'version') {
      requireValue(draft && !draft.published && text(input.caption) && text(input.script), '请选择未发布的内容，并填写脚本与文案。');
      const file = input.file as {key: string; name: string; type: string} | undefined;
      requireValue(!file || media.has(file.key), '附件暂不可用，请重新选择文件。');
      draft.versions.push({id: crypto.randomUUID(), number: draft.versions.length + 1, caption: text(input.caption), script: text(input.script), file, status: 'pending', at});
      event = `${mode === 'creator' ? '创作者' : '团队'}提交了内容 v${draft.versions.length}`;
    }
    if (action === 'publish') {
      requireValue(draft && version?.status === 'approved' && !draft.published, '请先取得最新版本的品牌确认。');
      draft.published = true; draft.publishedAt = at; event = '团队模拟完成发布，示例结果已更新';
    }
    if (action === 'creator') {
      const value = input.creator as Partial<Creator> | undefined;
      requireValue(value && text(value.name) && text(value.category) && text(value.reason) && text(value.deliverables), '请填写完整的候选资料。');
      requireValue(value.platform === 'Instagram', '第一阶段仅支持 Instagram。');
      for (const [name, max, min] of [['quote',9600,1],['cost',9600,0],['followers',1e8,0],['views',1e8,0],['us',100,0],['engagement',100,0]] as const) {
        const number = value[name]; requireValue(typeof number === 'number' && Number.isFinite(number) && number >= min && number <= max, '请检查候选资料中的数值。');
      }
      const old = state.creators.find(c => c.id === value.id);
      requireValue(!old?.confirmed, '已确认的报价不能在演示中修改。');
      const updated: Creator = {...value as Creator, id: old?.id ?? crypto.randomUUID(), handle: '演示候选人', selected: old?.selected ?? false, confirmed: false, color: old?.color ?? '#edede8', stage: '待确认'};
      if (old) Object.assign(old, updated); else state.creators.push(updated);
      event = `团队${old ? '更新' : '推荐'}了 ${updated.name}`;
    }
    if (action === 'brief') {requireValue(text(input.text), '需求不能为空。'); state.brief = text(input.text); event = '团队更新了项目需求';}
    if (action === 'geo') {const id = String(input.id); requireValue(['product','faq','measurement'].includes(id), '建议不存在。'); state.geoTasks = state.geoTasks.includes(id) ? state.geoTasks.filter(x => x !== id) : [...state.geoTasks,id]; event = '更新了 GEO 优化事项';}
    if (action === 'reset') {state = seedDemo(); event = '已恢复当前浏览器的初始演示项目';}
    state.activity.unshift({text: event, at}); state.activity = state.activity.slice(0,50);
    return instagramOnly({...state, revision: Number(input.revision) + 1});
  }, action === 'reset');
  if (action === 'reset') {
    for (const url of media.values()) URL.revokeObjectURL(url);
    media.clear();
  }
  return visibleState(next, mode);
}

export async function uploadMedia(file: File) {
  requireValue(['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type), '请选择 JPG、PNG、WebP、MP4 或 WebM 文件。');
  requireValue(file.size > 0 && file.size <= 20 * 1024 * 1024, '文件大小需在 20 MB 以内。');
  const key = crypto.randomUUID(); const db = await database();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('files','readwrite');
    transaction.objectStore('files').put(file, key);
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(failure(transaction.error)); transaction.onabort = () => reject(failure(transaction.error));
  });
  media.set(key, URL.createObjectURL(file));
  return {key, name: file.name.slice(0,240), type: file.type};
}
export function mediaUrl(key: string) {return media.get(key) ?? '';}
