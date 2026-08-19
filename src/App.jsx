"use client";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";
const sampleVideos = [
  { id: 1, title: "Cloud Cities: Built to Scale", publisher: "Maya Chen", producer: "Northstar Studio", genre: "Technology", ageRating: "PG", date: "18 Aug 2026", duration: "04:32", rating: 4.8, ratings: 128, views: "12.4K", accent: "violet", description: "A concise visual introduction to cloud-native architecture, elastic services and resilient digital cities." },
  { id: 2, title: "Wild Britain in Four Seasons", publisher: "Noah Williams", producer: "Field Notes", genre: "Documentary", ageRating: "U", date: "17 Aug 2026", duration: "07:18", rating: 4.6, ratings: 94, views: "8.1K", accent: "emerald", description: "A quiet journey through changing British landscapes, from winter coastlines to summer highlands." },
  { id: 3, title: "Designing for Everyone", publisher: "Aisha Rahman", producer: "Open Form", genre: "Education", ageRating: "U", date: "16 Aug 2026", duration: "05:41", rating: 4.9, ratings: 203, views: "19.7K", accent: "blue", description: "Five practical principles for building inclusive, accessible and human-centred digital experiences." },
  { id: 4, title: "Midnight Street Kitchen", publisher: "Leo Martins", producer: "Table Stories", genre: "Lifestyle", ageRating: "PG", date: "15 Aug 2026", duration: "03:56", rating: 4.5, ratings: 67, views: "6.9K", accent: "orange", description: "Meet the cooks transforming a city corner after dark with bold flavours and generous hospitality." },
  { id: 5, title: "Serverless in Sixty Seconds", publisher: "Maya Chen", producer: "Northstar Studio", genre: "Technology", ageRating: "U", date: "14 Aug 2026", duration: "01:00", rating: 4.7, ratings: 156, views: "22.3K", accent: "pink", description: "A rapid explanation of event-driven functions, automatic scaling and pay-per-use execution." },
  { id: 6, title: "The Art of Slow Travel", publisher: "Sam Okoro", producer: "Elsewhere Films", genre: "Travel", ageRating: "U", date: "12 Aug 2026", duration: "06:24", rating: 4.4, ratings: 81, views: "9.5K", accent: "teal", description: "Why taking the longer route can reveal more meaningful places, people and stories." }
];
const initialComments = [{ name: "James Foster", initials: "JF", time: "2 hours ago", text: "The architecture explanation at 2:10 is exceptionally clear. More videos like this, please!" }, { name: "Sara Malik", initials: "SM", time: "5 hours ago", text: "A polished overview without unnecessary jargon. The resilience example was particularly useful." }];
const symbols = { home: "\u2302", search: "\u2315", upload: "\u2191", play: "\u25B6", eye: "\u25C9", star: "\u2605", back: "\u2190", filter: "\u2261", logout: "\u2197" };
function Icon({ name }) {
  return <span aria-hidden="true" className="icon">{symbols[name] || "\u2022"}</span>;
}
function Home() {
const [page, setPage] = useState("dashboard");
const [videos, setVideos] = useState(sampleVideos);
const [selected, setSelected] = useState(sampleVideos[0]);
const [query, setQuery] = useState("");
const [genre, setGenre] = useState("All genres");
const [publisher, setPublisher] = useState("All publishers");
const [role, setRole] = useState("guest");
const [comments, setComments] = useState(initialComments);
const [comment, setComment] = useState("");
const [rating, setRating] = useState(0);
const [notice, setNotice] = useState("");

async function loadVideos() {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`);

    if (!response.ok) {
      throw new Error("Unable to load videos.");
    }

    const data = await response.json();

    const cloudVideos = data.map((video, index) => ({
      ...video,
      date: new Date(video.uploadedAt).toLocaleDateString("en-GB"),
      duration: "New",
      rating: 0,
      ratings: 0,
      views: "0",
      accent: ["violet", "emerald", "blue", "orange", "pink", "teal"][
        index % 6
      ]
    }));

    setVideos(cloudVideos.length ? cloudVideos : sampleVideos);
  } catch {
    setVideos(sampleVideos);
  }
}

useEffect(() => {
  loadVideos();
}, []);

const filtered = useMemo(
  () =>
    videos.filter(
      (video) =>
        (video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.publisher.toLowerCase().includes(query.toLowerCase())) &&
        (genre === "All genres" || video.genre === genre) &&
        (publisher === "All publishers" ||
          video.publisher === publisher)
    ),
  [videos, query, genre, publisher]
);
  function navigate(next) {
    if (next === "upload" && role !== "creator") {
      setNotice("Creator access is required. Use \u2018Demo creator\u2019 to preview uploads.");
      return;
    }
    setNotice("");
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openVideo(v) {
    setSelected(v);
    setPage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addComment(e) {
    e.preventDefault();
    if (role === "guest") {
      setNotice("Please sign in before posting a comment.");
      return;
    }
    if (!comment.trim()) return;
    setComments([{ name: role === "creator" ? "Alex Creator" : "Jamie Consumer", initials: role === "creator" ? "AC" : "JC", time: "Just now", text: comment.trim() }, ...comments]);
    setComment("");
    setNotice("Comment posted successfully.");
  }
  return <div className="app-shell"><header className="topbar"><button className="brand" onClick={() => navigate("dashboard")} aria-label="StreamScale home"><span className="brand-mark"><Icon name="play" /></span><span>Stream<span>Scale</span></span></button><nav aria-label="Primary navigation"><button className={page === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}><Icon name="home" />Dashboard</button><button className={page === "search" ? "active" : ""} onClick={() => navigate("search")}><Icon name="search" />Search</button><button className={page === "upload" ? "active" : ""} onClick={() => navigate("upload")}><Icon name="upload" />Upload</button></nav><div className="auth-actions">{role === "guest" ? <><button className="text-button" onClick={() => {
    setRole("consumer");
    setNotice("Signed in as a consumer.");
  }}>Log in</button><button className="primary small" onClick={() => {
    setRole("creator");
    setNotice("Demo creator access enabled.");
  }}>Demo creator</button></> : <><span className={`role-pill ${role}`}>{role}</span><button className="avatar">{role === "creator" ? "AC" : "JC"}</button><button className="icon-button" title="Log out" onClick={() => {
    setRole("guest");
    setPage("dashboard");
    setNotice("You have logged out.");
  }}><Icon name="logout" /></button></>}</div></header>{notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}<main>{page === "dashboard" && <Dashboard videos={videos} openVideo={openVideo} goSearch={() => navigate("search")} />} {page === "search" && <SearchPage videos={videos} query={query} setQuery={setQuery} genre={genre} setGenre={setGenre} publisher={publisher} setPublisher={setPublisher} results={filtered} openVideo={openVideo} />} {page === "details" && <Details video={selected} back={() => setPage("dashboard")} role={role} comments={comments} comment={comment} setComment={setComment} addComment={addComment} rating={rating} setRating={setRating} setNotice={setNotice} />} {page === "upload" && <UploadPage
  setNotice={setNotice}
  onUploaded={loadVideos} goDashboard={() => setPage("dashboard")} />}</main><Footer navigate={navigate} /></div>;
}
function Dashboard({ videos, openVideo, goSearch }) {
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">NEW THIS WEEK</span><h1>Stories worth watching.<br /><em>Built to scale.</em></h1><p>Discover original videos from independent creators across technology, culture, travel and more.</p><div className="hero-actions"><button className="primary" onClick={() => openVideo(videos[0])}><Icon name="play" />Watch featured</button><button className="secondary" onClick={goSearch}><Icon name="search" />Explore library</button></div><div className="trust-row"><span><strong>120+</strong> creators</span><span><strong>2,400+</strong> videos</span><span><strong>99.9%</strong> available</span></div></div><button className="featured-art" onClick={() => openVideo(videos[0])} aria-label="Play featured video"><div className="city" /><span className="play-button"><Icon name="play" /></span><span className="featured-label">FEATURED · TECHNOLOGY</span><div className="featured-caption"><strong>Cloud Cities: Built to Scale</strong><span>04:32</span></div></button></section><section className="content-section"><div className="section-heading"><div><span className="eyebrow dark">FRESH FROM CREATORS</span><h2>Latest videos</h2></div><button className="link-button" onClick={goSearch}>View all <span>→</span></button></div><div className="video-grid">{videos.map((v) => <VideoCard key={v.id} video={v} openVideo={openVideo} />)}</div></section><section className="scaling-strip"><div><span className="status-dot" /><p><strong>Cloud-native delivery</strong><br />Fast, resilient and globally available</p></div><div><strong>REST API</strong><span>Secure service layer</span></div><div><strong>Object storage</strong><span>Optimised video delivery</span></div><div><strong>Role controls</strong><span>Creator-only uploads</span></div></section></>;
}
function VideoCard({ video, openVideo }) {
  return <article className="video-card"><button className={`thumb ${video.accent}`} onClick={() => openVideo(video)} aria-label={`Play ${video.title}`}><span className="thumb-shape" /><span className="card-play"><Icon name="play" /></span><span className="duration">{video.duration}</span></button><div className="card-body"><span className="genre">{video.genre}</span><h3><button onClick={() => openVideo(video)}>{video.title}</button></h3><p>{video.publisher} · {video.date}</p><div className="card-meta"><span><Icon name="eye" /> {video.views}</span><span><Icon name="star" /> {video.rating}</span><span className="rating-tag">{video.ageRating}</span></div></div></article>;
}
function SearchPage({
  videos,
  query,
  setQuery,
  genre,
  setGenre,
  publisher,
  setPublisher,
  results,
  openVideo
}) {
  return <section className="page-section"><div className="page-intro"><span className="eyebrow dark">VIDEO LIBRARY</span><h1>Find your next watch</h1><p>Search original content by title, genre or publisher.</p></div><div className="search-panel"><label className="search-box"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles or publishers…" /></label><label><span>Genre</span><select value={genre} onChange={(e) => setGenre(e.target.value)}><option>All genres</option>{[...new Set(videos.map((v) => v.genre))].map((g) => <option key={g}>{g}</option>)}</select></label><label><span>Publisher</span><select value={publisher} onChange={(e) => setPublisher(e.target.value)}><option>All publishers</option>{[...new Set(videos.map((v) => v.publisher))].map((p) => <option key={p}>{p}</option>)}</select></label></div><div className="results-heading"><h2>{results.length} {results.length === 1 ? "result" : "results"}</h2><span><Icon name="filter" /> Filters applied live</span></div>{results.length ? <div className="video-grid">{results.map((v) => <VideoCard key={v.id} video={v} openVideo={openVideo} />)}</div> : <div className="empty"><Icon name="search" /><h3>No videos found</h3><p>Try a different search term or remove a filter.</p></div>}</section>;
}
function Details({ video, back, role, comments, comment, setComment, addComment, rating, setRating, setNotice }) {
  return <section className="details-page"><button className="back-button" onClick={back}><Icon name="back" /> Back to latest videos</button><div className="player-wrap"><video controls preload="metadata"><source
  src={
    video.videoUrl ||
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  }
  type="video/mp4"
/>Your browser does not support HTML5 video.</video></div><div className="details-layout"><article><span className="genre">{video.genre}</span><h1>{video.title}</h1><p className="byline">Published by <strong>{video.publisher}</strong> · {video.date} · {video.views} views</p><p className="description">{video.description}</p><div className="metadata"><div><span>Producer</span><strong>{video.producer}</strong></div><div><span>Genre</span><strong>{video.genre}</strong></div><div><span>Age rating</span><strong className="age-box">{video.ageRating}</strong></div><div><span>Duration</span><strong>{video.duration}</strong></div></div><section className="comments"><div className="comments-title"><h2>Comments</h2><span>{comments.length}</span></div><form onSubmit={addComment} className="comment-form"><div className="avatar muted">{role === "guest" ? "?" : role === "creator" ? "AC" : "JC"}</div><div><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={role === "guest" ? "Sign in to join the conversation" : "Add a thoughtful comment\u2026"} rows={3} /><button className="primary small" type="submit">Post comment</button></div></form>{comments.map((c, i) => <div className="comment" key={`${c.name}-${i}`}><div className="avatar muted">{c.initials}</div><div><strong>{c.name}</strong><span>{c.time}</span><p>{c.text}</p></div></div>)}</section></article><aside className="rating-panel"><span className="eyebrow dark">COMMUNITY RATING</span><div className="rating-number">{rating ? ((video.rating * video.ratings + rating) / (video.ratings + 1)).toFixed(1) : video.rating.toFixed(1)}</div><div className="stars display">★★★★★</div><p>Based on {video.ratings + (rating ? 1 : 0)} ratings</p><hr /><h3>Rate this video</h3><div className="stars interactive">{[1, 2, 3, 4, 5].map((n) => <button key={n} className={n <= rating ? "chosen" : ""} onClick={() => {
    if (role === "guest") setNotice("Please sign in before rating a video.");
    else {
      setRating(n);
      setNotice(`Your ${n}-star rating was saved.`);
    }
  }} aria-label={`${n} stars`}>★</button>)}</div><small>{rating ? `You rated this ${rating} out of 5` : "Select a star to rate"}</small></aside></div></section>;
}
function UploadPage({ setNotice, goDashboard, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  async function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!file || !title.trim()) {
      setNotice("Select a video and enter its title.");
      return;
    }

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setNotice("Only MP4 and WebM videos are accepted.");
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      setNotice("The maximum video size is 250 MB.");
      return;
    }

    try {
      setUploading(true);
      setProgress("Requesting secure upload permission...");

      const response = await fetch(`${API_BASE_URL}/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload authorisation failed.");
      }

      setProgress("Uploading video to Azure Blob Storage...");

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error("Azure Blob upload failed.");
      }
      setProgress("Saving video metadata...");

const blobName =
  result.blobName ||
  decodeURIComponent(
    new URL(result.uploadUrl).pathname
      .split("/")
      .slice(2)
      .join("/")
  );

const metadataResponse = await fetch(`${API_BASE_URL}/videos`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    blobName,
    title: title.trim(),
    publisher: formData.get("publisher"),
    producer: formData.get("producer"),
    genre: formData.get("genre"),
    ageRating: formData.get("ageRating"),
    description: formData.get("description") || ""
  })
});

const metadataResult = await metadataResponse.json();

if (!metadataResponse.ok) {
  throw new Error(
    metadataResult.error || "Unable to save video metadata."
  );
}

await onUploaded();

      setProgress("Upload completed.");
      setNotice(`“${title}” was uploaded successfully.`);

      setTimeout(() => {
        goDashboard();
      }, 1200);
    } catch (error) {
      setNotice(error.message);
      setProgress("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="page-section upload-page">
      <div className="page-intro">
        <span className="eyebrow dark">CREATOR STUDIO</span>
        <h1>Publish a new video</h1>
        <p>
          Upload your content and add accurate metadata to help
          viewers discover it.
        </p>
      </div>

      <form className="upload-form" onSubmit={submit}>
        <div className="upload-drop">
          <input
            id="video-file"
            type="file"
            accept="video/mp4,video/webm"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
          />

          <label htmlFor="video-file">
            <span className="upload-icon">
              <Icon name="upload" />
            </span>

            <strong>
              {file ? file.name : "Choose a video to upload"}
            </strong>

            <span>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "MP4 or WebM · Maximum 250 MB"}
            </span>
          </label>
        </div>

        <div className="form-card">
          <div className="form-heading">
            <div>
              <h2>Video details</h2>
              <p>Fields marked * are required.</p>
            </div>

            <span className="role-pill creator">
              creator access
            </span>
          </div>

          <div className="form-grid">
            <label className="full">
              <span>Title *</span>
              <input
                required
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter a clear, descriptive title"
              />
            </label>

            <label>
             <span>Publisher *</span>
             <input
               name="publisher"
               required
               placeholder="Creator or channel name"
             />
            </label>

            <label>
              <span>Producer *</span>
              <input
                name="producer"
                required
                placeholder="Production company or individual"
              />
            </label>

            <label>
              <span>Genre *</span>
              <select name="genre" required defaultValue="">
                <option value="" disabled>
                  Select a genre
                </option>
                <option>Technology</option>
                <option>Education</option>
                <option>Documentary</option>
                <option>Lifestyle</option>
                <option>Travel</option>
              </select>
            </label>

            <label>
              <span>Age rating *</span>
              <select name="ageRating" required defaultValue="">
                <option value="" disabled>
                  Select a rating
                </option>
                <option>U</option>
                <option>PG</option>
                <option>12</option>
                <option>15</option>
                <option>18</option>
              </select>
            </label>

            <label className="full">
              <span>Description</span>
              <textarea
                name="description"
                rows={4}
                placeholder="Tell viewers what this video is about…"
              />
            </label>
          </div>

          {progress && (
            <p className="upload-progress" role="status">
              {progress}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={goDashboard}
              disabled={uploading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary"
              disabled={uploading}
            >
              <Icon name="upload" />
              {uploading ? "Uploading..." : "Publish video"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
function Footer({ navigate }) {
  return <footer><button className="brand footer-brand" onClick={() => navigate("dashboard")}><span className="brand-mark"><Icon name="play" /></span><span>Stream<span>Scale</span></span></button><p>Cloud-native video discovery, built to scale.</p><span>© 2026 StreamScale</span></footer>;
}
export {
  Home as default
};
