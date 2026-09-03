'use client';

import React, { useState } from 'react';

export default function VideoManager() {
  const [videos, setVideos] = useState([
    { id: 1, title: 'Introduction to Islamic Jurisprudence', caption: 'Module 1 overview and core legal principles.', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, title: 'Arabic Grammar Fundamentals', caption: 'Detailed breakdown of syntax and noun declensions.', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  ]);
  
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title || !videoUrl) return;
    
    const newVideo = {
      id: Date.now(),
      title,
      caption: caption || 'No caption provided.',
      url: videoUrl
    };

    setVideos([newVideo, ...videos]);
    setTitle('');
    setCaption('');
    setVideoUrl('');
  };

  const handleDelete = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleUpdateCaption = (id) => {
    setVideos(videos.map(v => v.id === id ? { ...v, caption: editCaptionText } : v));
    setEditingId(null);
    setEditCaptionText('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>Admin Media Library & Video Manager</h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Upload instructional media, manage library titles, and update captions.</p>

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1rem' }}>Upload New Video</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input 
            type="text" 
            placeholder="Video Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            required 
          />
          <input 
            type="text" 
            placeholder="Video URL (e.g., MP4 link)" 
            value={videoUrl} 
            onChange={(e) => setVideoUrl(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            required 
          />
        </div>
        <input 
          type="text" 
          placeholder="Video Caption / Description" 
          value={caption} 
          onChange={(e) => setCaption(e.target.value)} 
          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} 
        />
        <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          Upload Video
        </button>
      </form>

      {/* Video List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {videos.map(video => (
          <div key={video.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '1rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{video.title}</h4>
              
              {editingId === video.id ? (
                <div style={{ margin: '0.5rem 0' }}>
                  <input 
                    type="text" 
                    value={editCaptionText} 
                    onChange={(e) => setEditCaptionText(e.target.value)} 
                    placeholder="Enter new caption..."
                    style={{ width: '100%', padding: '0.375rem', fontSize: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginBottom: '0.5rem', boxSizing: 'border-box' }}
                  />
                  <button onClick={() => handleUpdateCaption(video.id)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 0.5rem 0' }}>{video.caption}</p>
              )}

              <video width="240" controls style={{ borderRadius: '0.25rem', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {editingId !== video.id && (
                <button 
                  onClick={() => { setEditingId(video.id); setEditCaptionText(video.caption); }}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Edit Caption
                </button>
              )}
              <button 
                onClick={() => handleDelete(video.id)}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
