import { Database, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The public demo deliberately keeps vendor data disconnected. This preserves
 * the shape of the setup surface without collecting a key or making a vendor
 * request from a shared public browser.
 */
export default function InstagramData() {
  return <div className="instagram-data">
    <section className="panel api-connection">
      <div className="panel-heading">
        <div>
          <h2><Database size={20}/> Instagram 数据服务</h2>
          <p>Influencers.club · 当前演示保持只读</p>
        </div>
        <span className="status pending">等待连接</span>
      </div>
      <div className="api-pending">
        <div className="api-pending-mark"><ShieldCheck size={20}/></div>
        <div>
          <h3>Influencers.club 接入状态：等待连接</h3>
          <p>这个公开演示不收集 API key，也不会替你注册、查询或保存真实博主资料。下面的搜索控件仅用于展示正式接入后的页面结构。</p>
        </div>
      </div>
      <div className="api-signup">
        <strong>如需接入真实资料</strong>
        <ol>
          <li>由项目负责人在 Influencers.club 创建并验证自己的账号。</li>
          <li>在受控的正式环境中配置服务商凭据与访问权限。</li>
          <li>先确认额度、数据来源和隐私范围，再开始查询。</li>
        </ol>
        <a href="https://influencers.club/" target="_blank" rel="noreferrer">查看 Influencers.club 账号与文档 <ExternalLink size={13}/></a>
      </div>
    </section>

    <div className="api-queries">
      <section className="panel" aria-disabled="true">
        <div className="panel-heading"><h2>寻找美国博主</h2><Search size={19}/></div>
        <form onSubmit={event => event.preventDefault()}>
          <label>内容关键词<Input disabled value="beauty / makeup" readOnly /></label>
          <div className="form-grid"><label>最少粉丝<Input disabled type="number" value="10000" readOnly /></label><label>最多粉丝<Input disabled type="number" value="200000" readOnly /></label></div>
          <Button disabled type="button"><Search size={16}/> 等待连接</Button>
          <p className="data-note">连接服务商后才会启用查询；当前没有返回任何真实结果。</p>
        </form>
      </section>
      <section className="panel" aria-disabled="true">
        <div className="panel-heading"><h2>读取已知账号的内容</h2><ExternalLink size={19}/></div>
        <form onSubmit={event => event.preventDefault()}>
          <label>Instagram 用户名<Input disabled value="@username" readOnly /></label>
          <Button disabled type="button">等待连接</Button>
          <p className="data-note">公开演示不读取外部账号；正式接入后仍需确认账号授权、公开范围和供应商额度。</p>
        </form>
      </section>
    </div>

    <section className="panel">
      <div className="panel-heading"><h2>已保存的真实资料</h2><span>0 位</span></div>
      <div className="empty-state"><Database/><h3>等待连接</h3><p>当前没有真实账号数据。示例创作者只用于模拟项目流程，不会混入这里。</p></div>
    </section>
    <p className="data-note">公开演示不会调用外部服务商，当前没有真实账号资料，也不代表已经建立真实合作。</p>
  </div>;
}
