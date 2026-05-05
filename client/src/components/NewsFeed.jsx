import './NewsFeed.css';

const NEWS = [
  {
    id: 1,
    category: 'Tech',
    title: 'OpenAI releases GPT-5 with real-time voice and vision',
    summary: 'The new model handles multimodal inputs natively and cuts hallucination rates by 40%.',
    author: 'TechCrunch',
    time: '2h ago',
  },
  {
    id: 2,
    category: 'Security',
    title: 'Critical zero-day found in popular npm package (500M weekly downloads)',
    summary: 'Researchers discovered a supply-chain attack vector in a widely used utility library.',
    author: 'Bleeping Computer',
    time: '4h ago',
  },
  {
    id: 3,
    category: 'Web Dev',
    title: 'React 20 announced — compiler now ships by default',
    summary: 'The React team confirmed the compiler will be on by default, eliminating the need for useMemo and useCallback.',
    author: 'React Blog',
    time: '6h ago',
  },
  {
    id: 4,
    category: 'Cloud',
    title: 'AWS launches new region in Tel Aviv with ultra-low latency',
    summary: 'Israeli developers can now deploy workloads 60ms closer to end users.',
    author: 'AWS News',
    time: '8h ago',
  },
  {
    id: 5,
    category: 'AI',
    title: 'GitHub Copilot now writes entire PRs autonomously',
    summary: 'The new "agent mode" picks up issues, writes code, runs tests and opens a PR — no human needed.',
    author: 'GitHub Blog',
    time: '1d ago',
  },
];

const CATEGORY_COLORS = {
  Tech: '#6366f1',
  Security: '#ef4444',
  'Web Dev': '#22c55e',
  Cloud: '#f59e0b',
  AI: '#8b5cf6',
};

export default function NewsFeed() {
  return (
    <aside className="news-feed">
      <h3 className="news-feed__title">Latest News</h3>
      <ul className="news-feed__list">
        {NEWS.map((item) => (
          <li key={item.id} className="news-item">
            <div className="news-item__header">
              <span
                className="news-item__category"
                style={{ background: CATEGORY_COLORS[item.category] ?? 'var(--color-primary)' }}
              >
                {item.category}
              </span>
              <span className="news-item__time">{item.time}</span>
            </div>
            <p className="news-item__title">{item.title}</p>
            <p className="news-item__summary">{item.summary}</p>
            <span className="news-item__source">{item.author}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
