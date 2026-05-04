import { useState } from 'react';
import MarkdownPreview from './MarkdownPreview';
import Spinner from './Spinner';
import './PostForm.css';

const CATEGORIES = ['General', 'Tech', 'News', 'Discussion', 'Question', 'Other'];

export default function PostForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    category: initial.category || 'General',
    tags: initial.tags?.join(', ') || '',
    content: initial.content || '',
    author: initial.author || '',
    likes: initial.likes || [],
    createdAt: initial.createdAt || '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        className="post-form__input"
        name="title"
        placeholder="Post title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <select
        className="post-form__input"
        name="category"
        value={form.category}
        onChange={handleChange}
      >
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input
        className="post-form__input"
        name="tags"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={handleChange}
      />
      <div className="post-form__editor">
        <textarea
          className="post-form__textarea"
          name="content"
          placeholder="Write your post in Markdown..."
          value={form.content}
          onChange={handleChange}
          required
          rows={12}
        />
        <MarkdownPreview content={form.content} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? <Spinner /> : 'Publish'}
      </button>
    </form>
  );
}
