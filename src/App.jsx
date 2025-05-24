import { useEffect, useState } from "react";
import "./index.css";
import logo from "../public/images/logo.png";
import logoPR from "../public/images/logoPR.png";
import TopLogoPR from "../public/images/TopLogoPR.jpg";
// import logo from "../public/images/logo.png";
import { MdHome } from "react-icons/md";

const clientId = '2bfeb25127d34c8fa26bae287a318f97';
const redirectUri = window.location.origin + '/';
const scope = 'user-read-private user-read-email user-top-read user-library-read';

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token") || "");
  const [tracks, setTracks] = useState([]);
  const [liked, setLiked] = useState([]);
  const [lib, setLib] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    if (token) {
      localStorage.setItem("access_token", token);
      setAccessToken(token);
      window.location.hash = "";
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchTopTracks();
    }
  }, [accessToken]);

  const login = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&show_dialog=true`;
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setAccessToken("");
    window.location.href = redirectUri;
  };

  const fetchTopTracks = () => {
    fetch("https://api.spotify.com/v1/me/top/tracks?limit=15", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setTracks(data.items || []))
      .catch(console.error);
  };

  const fetchLikedSongs = () => {
    fetch("https://api.spotify.com/v1/me/tracks", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setLiked(data.items || []))
      .catch(console.error);
  };

  const fetchLibrary = () => {
    fetch("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setLib(data.items || []))
      .catch(console.error);
  };

  const handleSearch = () => {
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(search)}&type=track`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setResults(data.tracks.items || []))
      .catch(console.error);
  };

  const TrackCard = ({ id }) => (
    <div className="song-card">
      <iframe
        src={`https://open.spotify.com/embed/track/${id}`}
        width="350"
        height="100"
        frameBorder="0"
        allow="encrypted-media"
      ></iframe>
    </div>
  );

  const PlaylistCard = ({ id }) => (
    <div className="playlist-card">
      <iframe
        src={`https://open.spotify.com/embed/playlist/${id}`}
        width="300"
        height="380"
        frameBorder="0"
        allowtransparency="true"
        allow="encrypted-media"
      ></iframe>
    </div>
  );

  return (
    <div className="app">
      <button className="fa-solid fa-bars" onClick={() => {
        document.querySelector(".sidebar").style.left = "0";
        document.querySelector(".overlay").style.visibility = "visible";
      }}></button>

      <div className="sidebar">
        <div className="logo">
          <img src={logoPR} alt="Logo" />
        </div>
        <div className="nav">
          <ul>
            <li><button onClick={fetchTopTracks}><i className="fa fa-home"></i><MdHome /> Home</button></li>
            <li><button onClick={fetchLibrary}><i className="fa fa-book"></i> Your Library</button></li>
          </ul>
        </div>
        <div className="nav2">
          <ul>
            <li>
              <div className="createplaylist">
                <span className="bold">Create your first playlist</span>
                <span className="light">It's easy we will help you.</span>
                <button className="playlistbt">create playlist</button>
              </div>
            </li>
            <li><button onClick={fetchLikedSongs}><i className="fa fa-heart"></i> Liked Songs</button></li>
            <li><span>Premium</span></li>
          </ul>
        </div>
        <div className="pol">
          <ul>
            <li><span><i className="fa fa-cookie"></i> Cookies</span></li>
            <li><span>Privacy Policy</span></li>
            <li><span>Support</span></li>
            <li><span><i className="fa fa-language"></i> Language</span></li>
            <li><button className="logout-class" onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>

      <div className="overlay" onClick={() => {
        document.querySelector(".sidebar").style.left = "-250px";
        document.querySelector(".overlay").style.visibility = "hidden";
      }}></div>

      <div className="topbar">
        <div className="search-container">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a song..."
            id="search-input"
          />
          <button onClick={handleSearch} id="search-btn" className="fas fa-search"></button>
        </div>
        <div className="navbar">
          {accessToken ? (
            <span className="log">
              <button onClick={logout}>Logout</button>
            </span>
          ) : (
            <span className="log">
              <button onClick={login}>Login</button>
            </span>
          )}
        </div>
      </div>

      <main>
        {results.length > 0 && (
          <div id="results">
            {results.map((track) => (
              <TrackCard key={track.id} id={track.id} />
            ))}
          </div>
        )}

        {tracks.length > 0 && (
          <div id="top">
            <h2>Your Top 15 Tracks</h2>
            <div className="song-grid">
              {tracks.map((track) => (
                <TrackCard key={track.id} id={track.id} />
              ))}
            </div>
          </div>
        )}

        {liked.length > 0 && (
          <div id="liked">
            <h2>Your Liked Songs</h2>
            <div className="liked-songs-class">
              {liked.map((item) => (
                <TrackCard key={item.track.id} id={item.track.id} />
              ))}
            </div>
          </div>
        )}

        {lib.length > 0 && (
          <div id="lib">
            <h2>Your Library</h2>
            <div className="lib-songs-class">
              {lib.map((item) => (
                <PlaylistCard key={item.id} id={item.id} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
