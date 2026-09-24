export type Mode = "brand" | "team" | "creator";
export type Platform = "Instagram" | "TikTok" | "YouTube";
export type ContentConcept = {title:string;description:string};
export type Creator = {
  id:string;
  name:string;
  handle:string;
  category:string;
  platform:Platform;
  followers:number;
  views:number;
  us:number;
  engagement:number;
  quote:number;
  cost?:number;
  reason:string;
  deliverables:string;
  selected:boolean;
  confirmed:boolean;
  color:string;
  stage:string;
  photo:string;
  city:string;
  languages:string;
  bio:string;
  specialties:string[];
  audienceAge:string;
  contentConcepts:ContentConcept[];
};
export type Version = {id:string;number:number;caption:string;script:string;file?:{key:string;name:string;type:string};status:"pending"|"changes"|"approved";at:string};
export type Draft = {id:string;creatorId:string;versions:Version[];comments:{id:string;versionId:string;author:string;text:string;at:string}[];published:boolean;publishedAt?:string};
export type DemoState = {revision:number;migrationVersion:number;creators:Creator[];drafts:Draft[];activity:{text:string;at:string}[];brief:string;geoTasks:string[]};

export const DEMO_MIGRATION_VERSION = 2;
export const DEFAULT_BRIEF = "以美国美妆受众为核心，围绕雕花口红的东方设计与日常妆容场景，完成一轮创作者内容测试。品牌曝光为先；内容可根据创作者特长分发至 Instagram、TikTok 或 YouTube Shorts。样品、卖点和发布文案由品牌确认。";
const PLATFORM_BY_CREATOR:Record<string,Platform> = {maya:"Instagram",olivia:"Instagram",sophia:"TikTok",ava:"Instagram",elena:"TikTok",jordan:"YouTube"};

export const money=(v:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);
export const compact=(v:number)=>new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(v);

export function seedDemo():DemoState{return {
  revision:0,
  migrationVersion:DEMO_MIGRATION_VERSION,
  brief:DEFAULT_BRIEF,
  geoTasks:[],
  creators:[
    {id:"maya",name:"Maya Chen",handle:"示例档案 · 无公开账号链接",category:"东方妆容 / 美妆教程",platform:"Instagram",followers:128000,views:62400,us:76,engagement:3.8,quote:3200,cost:3200,reason:"擅长把产品细节融入日常妆容；受众与美国美妆新品推广方向匹配。",deliverables:"1 条 Reel + 3 帧 Story · 自然发布，不含广告使用权",selected:true,confirmed:true,color:"#d9e8ef",stage:"制作中",photo:"/florasis-demo/creators/maya.png",city:"San Francisco, CA",languages:"英语 / 普通话",bio:"旧金山美妆教育者，擅长用清晰步骤拆解东方妆容与日常通勤造型。",specialties:["日常妆容","东方美学","产品特写"],audienceAge:"25–34 岁",contentConcepts:[{title:"30 秒通勤妆：从细节到上唇",description:"以早晨通勤为线索，先拍雕花细节，再用自然光完成一支口红的全脸搭配。"},{title:"纹样近看：一件可以带出门的艺术品",description:"用手部近景和短旁白讲清包装工艺的观看体验，保持内容轻巧而真实。"}]},
    {id:"olivia",name:"Olivia Brooks",handle:"示例档案 · 无公开账号链接",category:"彩妆测评 / 真实试色",platform:"Instagram",followers:68000,views:31200,us:82,engagement:4.2,quote:2100,cost:2100,reason:"测评内容清晰，适合用近景展示雕花设计与上唇效果。",deliverables:"1 条 Reel + 2 帧 Story · 自然发布，不含广告使用权",selected:false,confirmed:false,color:"#eddcda",stage:"待确认",photo:"/florasis-demo/creators/olivia.png",city:"New York, NY",languages:"英语",bio:"纽约彩妆测评创作者，习惯用可复现的试色和优缺点对比帮助观众做选择。",specialties:["真实试色","成分讲解","近景测评"],audienceAge:"25–34 岁",contentConcepts:[{title:"一支口红的三种光线试色",description:"在窗边、室内与夜间灯光下记录色泽变化，让观众更容易判断日常适配度。"},{title:"包装很美，使用感怎么样？",description:"先看雕花设计，再按上色、持妆与补涂节奏做一条诚实的开箱测评。"}]},
    {id:"sophia",name:"Sophia Park",handle:"示例档案 · 无公开账号链接",category:"生活方式 / 通勤妆容",platform:"TikTok",followers:94000,views:48700,us:71,engagement:4.7,quote:1700,cost:1700,reason:"通勤妆容和开箱内容自然，适合用短节奏覆盖 TikTok 上的日常美妆场景。",deliverables:"1 条 TikTok 视频 + 置顶评论互动 · 自然发布，不含广告使用权",selected:false,confirmed:false,color:"#e6e2f0",stage:"待确认",photo:"/florasis-demo/creators/sophia.png",city:"Seattle, WA",languages:"英语 / 韩语",bio:"西雅图生活方式创作者，把通勤、咖啡和轻妆日常剪成节奏明快的短视频。",specialties:["通勤妆容","生活方式","快速开箱"],audienceAge:"18–24 岁",contentConcepts:[{title:"咖啡前的 15 秒唇色选择",description:"用三个快速切镜呈现当天穿搭、咖啡店光线和适合的唇色，轻松带出产品。"},{title:"包里只带一支：从白天到晚餐",description:"记录同一支口红在一整天场景中的补涂与搭配，突出方便携带的使用情境。"}]},
    {id:"ava",name:"Ava Williams",handle:"示例档案 · 无公开账号链接",category:"创意彩妆 / 色彩表达",platform:"Instagram",followers:87000,views:42600,us:79,engagement:3.5,quote:2500,cost:2500,reason:"色彩表达鲜明，可用一条完整妆容强化系列辨识度。",deliverables:"1 条 Reel + 3 帧 Story · 自然发布，不含广告使用权",selected:false,confirmed:false,color:"#e4eadf",stage:"待确认",photo:"/florasis-demo/creators/ava.png",city:"Los Angeles, CA",languages:"英语 / 西班牙语",bio:"洛杉矶创意彩妆创作者，擅长把饱和色彩与日常造型结合，画面辨识度高。",specialties:["创意彩妆","色彩搭配","造型叙事"],audienceAge:"25–34 岁",contentConcepts:[{title:"一支红色，三种情绪",description:"以同一支唇色搭配三套低饱和服装，用色彩变化讲一个从白天到夜晚的短故事。"},{title:"把东方纹样带进周末妆容",description:"用镜面、手部和半身构图逐步展示妆容，保留艺术感同时让步骤看得懂。"}]},
    {id:"elena",name:"Elena Ruiz",handle:"示例档案 · 无公开账号链接",category:"美妆生活 / 礼物场景",platform:"TikTok",followers:112000,views:55800,us:84,engagement:4.5,quote:1900,cost:1900,reason:"擅长把美妆产品放进节日与送礼场景，能用双语语境拓展内容触达。",deliverables:"1 条 TikTok 视频 + 1 次评论区互动 · 自然发布，不含广告使用权",selected:false,confirmed:false,color:"#f0dfd7",stage:"待确认",photo:"/florasis-demo/creators/elena.png",city:"Miami, FL",languages:"英语 / 西班牙语",bio:"迈阿密美妆生活创作者，关注送礼、节日聚会和能留下记忆点的产品细节。",specialties:["礼物场景","节日妆容","双语表达"],audienceAge:"25–34 岁",contentConcepts:[{title:"送给爱美朋友的第一支雕花口红",description:"从拆盒、触摸纹样到试色，围绕一份有故事感的礼物完成轻量推荐。"},{title:"海边晚餐的暖调唇妆",description:"在迈阿密傍晚的暖光里完成一套聚会妆容，展示色彩如何适配假日氛围。"}]},
    {id:"jordan",name:"Jordan Ellis",handle:"示例档案 · 无公开账号链接",category:"男士审美 / 文化评论",platform:"YouTube",followers:76000,views:36400,us:88,engagement:3.9,quote:2300,cost:2300,reason:"内容更偏文化观察与设计评论，适合补充对东方工艺和礼赠价值的深度解释。",deliverables:"1 条 YouTube Shorts + 描述区提及 · 自然发布，不含广告使用权",selected:false,confirmed:false,color:"#e3e0d8",stage:"待确认",photo:"/florasis-demo/creators/jordan.png",city:"Chicago, IL",languages:"英语",bio:"芝加哥文化与男士审美创作者，擅长用克制的旁白讲设计、礼物与日常仪式感。",specialties:["设计评论","礼赠审美","文化观察"],audienceAge:"35–44 岁",contentConcepts:[{title:"为什么一支口红也值得被收藏",description:"从雕花、材质与随身携带的仪式感切入，用设计评论的方式介绍产品。"},{title:"给重要的人选一份有故事的礼物",description:"以送礼决策为主线，说明包装与使用场景如何共同构成一份有记忆点的礼物。"}]}
  ],
  drafts:[{id:"draft-maya",creatorId:"maya",versions:[{id:"v1-maya",number:1,caption:"A little art in my everyday routine. Exploring the details of this engraved lipstick from Florasis. #ad #Florasis #EverydayBeauty",script:"00–05s｜近景展示雕花口红与包装。\n05–18s｜自然光下试色，描述个人使用感受。\n18–30s｜完成日常妆容；展示产品名称与广告合作标识。\n画面与文字均为脚本提案，产品功效表述须经品牌核实。",status:"pending",at:"2026-09-20T10:00:00Z"}],comments:[],published:false}],
  activity:[{text:"William 提交了 Maya 的第一版脚本与文案",at:"2026-09-20T10:00:00Z"},{text:"品牌已确认 Maya；另外 5 位候选人待选择",at:"2026-09-19T14:00:00Z"}]
};}

export function visibleState(state:DemoState,mode:string):DemoState {if(mode==="team")return state;return {...state,creators:state.creators.map(({cost,...c})=>c)};}

function normalizedBrief(brief:string){
  if(!brief)return DEFAULT_BRIEF;
  return brief
    .replaceAll("首批内容采用 Instagram Reels 与 Stories", "内容可根据创作者特长分发至 Instagram、TikTok 或 YouTube Shorts")
    .replaceAll("首批内容以 Instagram Reels 与 Stories", "内容可根据创作者特长分发至 Instagram、TikTok 或 YouTube Shorts")
    .replaceAll("Instagram Reels 为主，TikTok 为辅", "Instagram、TikTok 或 YouTube Shorts");
}

function derivedStage(creator:Creator,drafts:Draft[]){
  const draft=drafts.find(item=>item.creatorId===creator.id);
  const version=draft?.versions.at(-1);
  return draft?.published?"已发布（模拟）":version?.status==="approved"?"待发布":version?.status==="changes"?"待修改":version?.status==="pending"?"待品牌审稿":creator.confirmed?"待敲定合作":creator.stage;
}

/**
 * Enriches the browser-local seed once while retaining user-authored drafts,
 * comments, media references and later selections. Version 2 intentionally
 * resets the old shortlist to Maya only because the original seed was
 * Instagram-only; a migrated state is never reset again.
 */
export function normalizeDemoState(input?:DemoState):DemoState {
  const source=input??seedDemo();
  const sourceCreators=Array.isArray(source.creators)?source.creators:[];
  const sourceById=new Map(sourceCreators.map(creator=>[creator.id,creator]));
  const migrated=Number(source.migrationVersion??0)>=DEMO_MIGRATION_VERSION;
  const drafts=Array.isArray(source.drafts)?source.drafts:seedDemo().drafts;
  const creators=seedDemo().creators.map(profile=>{
    const previous=sourceById.get(profile.id);
    const selected=migrated?(previous?.selected??profile.selected):profile.id==="maya";
    const confirmed=migrated?(previous?.confirmed??profile.confirmed):profile.id==="maya";
    return {
      ...profile,
      ...(previous?.cost===undefined?{}:{cost:previous.cost}),
      platform:PLATFORM_BY_CREATOR[profile.id]??profile.platform,
      selected,
      confirmed,
      stage:derivedStage({...profile,selected,confirmed},drafts)
    };
  });
  const knownIds=new Set(creators.map(creator=>creator.id));
  const extraCreators=sourceCreators.filter(creator=>!knownIds.has(creator.id)).map(creator=>({
    ...creator,
    handle:creator.handle||"示例档案 · 无公开账号链接",
    platform:PLATFORM_BY_CREATOR[creator.id]??creator.platform??"Instagram",
    selected:migrated?Boolean(creator.selected):false,
    confirmed:migrated?Boolean(creator.confirmed):false,
    photo:creator.photo||"",
    city:creator.city||"美国 · 示例城市",
    languages:creator.languages||"英语",
    bio:creator.bio||creator.reason||"示例创作者档案，具体内容方向待正式资料确认。",
    specialties:Array.isArray(creator.specialties)&&creator.specialties.length?creator.specialties:[creator.category||"美妆内容"],
    audienceAge:creator.audienceAge||"年龄未提供",
    contentConcepts:Array.isArray(creator.contentConcepts)&&creator.contentConcepts.length?creator.contentConcepts:[{title:"内容方向待补充",description:"示例候选的内容方向将在正式资料确认后补充。"}]
  }));
  return {
    ...source,
    revision:Number.isFinite(source.revision)?source.revision:0,
    migrationVersion:DEMO_MIGRATION_VERSION,
    brief:normalizedBrief(source.brief),
    creators:[...creators,...extraCreators.map(creator=>({...creator,stage:derivedStage(creator,drafts)}))],
    drafts,
    activity:Array.isArray(source.activity)?source.activity:seedDemo().activity,
    geoTasks:Array.isArray(source.geoTasks)?source.geoTasks:[]
  };
}
