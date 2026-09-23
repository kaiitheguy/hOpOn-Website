import { seedDemo, visibleState, instagramOnly, type DemoState } from './demo';

const DATABASE = 'hopon-florasis-public-demo-v1';
const media = new Map<string, string>();
const allowed = ['toggle', 'confirm', 'comment', 'approve', 'geo'];
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
  return new Error(error?.name === 'QuotaExceededError' ? '浏览器空间不足，演示进度未保存。请释放浏览器存储空间后重试。' : '无法保存这次演示操作，请重试。');
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
function stateTransaction(update?: (state: DemoState) => DemoState) {
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
      } catch (e) {problem = e instanceof Error ? e : new Error('操作失败。'); transaction.abort();}
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(problem ?? failure(transaction.error));
    transaction.onerror = () => reject(problem ?? failure(transaction.error));
  }));
}
export async function loadDemo(_mode: 'brand' = 'brand'): Promise<DemoState> {
  const state = await stateTransaction();
  await populateMedia(state);
  return visibleState(state, 'brand');
}
const text = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 5000) : '';
function requireValue(condition: unknown, message: string): asserts condition {if (!condition) throw new Error(message);}

export async function mutateDemo(input: Record<string, unknown>): Promise<DemoState> {
  const action = String(input.action ?? '');
  requireValue(input.mode === 'brand' && allowed.includes(action), '此演示仅支持品牌侧操作。');
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
      draft.comments.push({id: crypto.randomUUID(), versionId: version.id, author: '品牌团队', text: text(input.text), at});
      version.status = 'changes';
      event = '新增了内容反馈';
    }
    if (action === 'approve') {
      requireValue(draft && version && !draft.published && version.status !== 'approved', '此版本无法重复确认。');
      version.status = 'approved'; event = `品牌通过了内容 v${version.number}`;
    }
    if (action === 'geo') {const id = String(input.id); requireValue(['product','faq','measurement'].includes(id), '建议不存在。'); state.geoTasks = state.geoTasks.includes(id) ? state.geoTasks.filter(x => x !== id) : [...state.geoTasks,id]; event = '更新了 GEO 优化事项';}
    state.activity.unshift({text: event, at}); state.activity = state.activity.slice(0,50);
    return instagramOnly({...state, revision: Number(input.revision) + 1});
  });
  return visibleState(next, 'brand');
}

export function mediaUrl(key: string) {return media.get(key) ?? '';}
