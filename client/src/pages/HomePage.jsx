import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import SortBar from '../components/SortBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import NewsFeed from '../components/NewsFeed';
import api from '../services/api';
import './HomePage.css';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'new';
  const page = searchParams.get('page') || '1';

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [infinitePosts, setInfinitePosts] = useState([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  // Paginated fetch
  useEffect(() => {
    setLoading(true);
    api.get('/posts', { params: { sort, page } })
      .then(({ data }) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [sort, page]);

  // Infinite scroll fetch
  useEffect(() => {
    setInfinitePosts([]);
    setInfinitePage(1);
    setHasMore(true);
  }, [sort]);

  useEffect(() => {
    if (!hasMore) return;
    api.get('/posts', { params: { sort, page: infinitePage, limit: 5 } })
      .then(({ data }) => {
        setInfinitePosts((prev) => [...prev, ...(data.posts || [])]);
        if (infinitePage >= data.totalPages) setHasMore(false);
      });
  }, [infinitePage, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setInfinitePage((p) => p + 1);
        }
      },
      { rootMargin: '200px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <>
      <Navbar />
      <main className="home">
        <div className="home__layout">
          <div className="home__main">
            <SortBar />
            {loading ? <Spinner /> : (
              <>
                <div className="home__feed">
                  {posts.map((post) => <PostCard key={post._id} post={post} />)}
                </div>
                <Pagination totalPages={totalPages} />
              </>
            )}
            <div className="home__infinite">
              {infinitePosts.map((post) => <PostCard key={post._id + '-inf'} post={post} />)}
              <div ref={sentinelRef} className="home__sentinel" />
              {!hasMore && <p className="home__end">No more posts</p>}
            </div>
          </div>
          <NewsFeed />
        </div>
      </main>
    </>
  );
}
