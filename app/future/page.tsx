const FEATURES = [
  {
    title: "个性化饮食计划",
    description: "根据您的健康数据与口味偏好，自动生成膳食方案。",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    tag: "即将推出"
  },
  {
    title: "高级天气风险分析",
    description: "结合天气与环境指标，提前发出痛风风险预警。",
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
    tag: "即将推出"
  },
  {
    title: "社区支持小组",
    description: "与志同道合的伙伴互相鼓励、分享控酸心得。",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    tag: "即将推出"
  }
];

export default function FuturePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <aside className="hidden w-72 flex-col justify-between border-r border-gray-200 bg-white p-6 md:flex">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">健康中心</h1>
          <p className="mt-2 text-sm text-gray-500">您的健康，化繁为简。</p>
          <nav className="mt-8 space-y-2 text-sm">
            <NavLink label="饮食记录" />
            <NavLink label="天气风险" />
            <NavLink label="社区" />
            <NavLink label="未来功能" active />
          </nav>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} UA Health</p>
      </aside>
      <section className="flex flex-1 flex-col p-6 md:p-12">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">即将推出的功能</h2>
          <p className="mt-2 text-gray-500">我们正在打造更多工具，帮助您全面管理痛风与高尿酸。</p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="relative h-48 w-full bg-gray-200">
                <img src={`${feature.image}?auto=format&fit=crop&w=900&q=80`} alt={feature.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="mt-2 flex-1 text-gray-600">{feature.description}</p>
                <button className="mt-6 w-full rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-500" disabled>
                  {feature.tag}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

type NavLinkProps = {
  label: string;
  active?: boolean;
};

function NavLink({ label, active }: NavLinkProps) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-xl px-4 py-2 transition-colors ${
        active ? "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span>{label}</span>
      {active && <span className="text-xs">●</span>}
    </button>
  );
}
