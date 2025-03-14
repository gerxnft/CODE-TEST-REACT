import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import "./App.css";

const App = () => {
  const [launches, setLaunches] = useState([]); 
  const [displayedLaunches, setDisplayedLaunches] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedLaunch, setExpandedLaunch] = useState(null);
  const containerRef = useRef(null);
  const batchSize = 10;
  const [index, setIndex] = useState(batchSize);

  useEffect(() => {
    fetchLaunches();
  }, []);

  const fetchLaunches = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.spacexdata.com/v3/launches?order=desc");
      const data = await res.json();
      setLaunches(data); 
      setDisplayedLaunches(data.slice(0, batchSize)); 
    } catch (error) {
      console.error("Error fetching launches:", error);
    }
    setLoading(false);
  };

  const handleScroll = () => {
    if (!containerRef.current || loading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMore();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, displayedLaunches]);

  const loadMore = () => {
    if (index >= filteredLaunches.length) return;
    setLoading(true);
    setTimeout(() => {
      setDisplayedLaunches(filteredLaunches.slice(0, index + batchSize));
      setIndex((prev) => prev + batchSize);
      setLoading(false);
    }, 500);
  };

  const getStatus = (launch) => {
    if (launch.upcoming) return "Upcoming";
    return launch.launch_success ? "Success" : "Failed";
  };

  const toggleExpand = (launch_date_unix) => {
    setExpandedLaunch(expandedLaunch === launch_date_unix ? null : launch_date_unix);
  };

  const filteredLaunches = launches.filter((launch) =>
    launch.mission_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setDisplayedLaunches(filteredLaunches.slice(0, batchSize));
    setIndex(batchSize);
  }, [search]);

  return (
    <div className="p-4 mx-auto text-white min-h-screen flex flex-col justify-center items-center bg-black">
      <div className="text-center">
        <img
          src="https://imgur.com/TqRkI1z.png"
          alt="spacexlogo"
          className="w-40 mb-10"
        />
      </div>
      <div className="w-full max-w-2xl relative">
        <input
          type="text"
          placeholder="SEARCH MISSION..."
          className="w-full p-2 pl-10 bg-black border border-gray-700 rounded mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <svg
          className="absolute left-3 top-3 w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
      </div>

      <div
        ref={containerRef}
        className="bg-[#00000050] shadow-lg rounded-lg overflow-y-auto w-full max-w-2xl border border-[#FFFFFF20]"
        style={{ height: "500px" }}
      >
        {displayedLaunches.map((launch) => (
          <div key={launch.launch_date_unix} className="border-b border-[#FFFFFF20]">
            <div
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#FFFFFF] hover:text-[#000] transition duration-300"
              onClick={() => toggleExpand(launch.launch_date_unix)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">{launch.mission_name}</h2>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  launch.upcoming
                    ? "bg-yellow-500 text-white"
                    : launch.launch_success
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {getStatus(launch)}
              </span>
            </div>

            {expandedLaunch === launch.launch_date_unix && (
              <div className="bg-[#202020] p-4 transition-all duration-300">
                <p className="text-sm text-gray-300">
                  📅 <strong>Launch Date:</strong>{" "}
                  {formatDistanceToNow(new Date(launch.launch_date_utc), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  📝 <strong>Description:</strong> {launch.details || "N/A"}
                </p>
                <div className="mt-3">
                  {launch.links.article_link && (
                    <p>
                      🔗{" "}
                      <a
                        href={launch.links.article_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:underline"
                      >
                        Read Article
                      </a>
                    </p>
                  )}
                  {launch.links.video_link && (
                    <p>
                      🎥{" "}
                      <a
                        href={launch.links.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:underline"
                      >
                        Watch Video
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center mt-4 animate-pulse">
          <div className="rounded-full h-8 w-8 border-t-2 border-gray-400 border-opacity-50 animate-spin"></div>
        </div>
      )}
      {displayedLaunches.length >= filteredLaunches.length && !loading && (
        <p className="text-center mt-4 text-gray-500">No more launches found</p>
      )}
    </div>
  );
};

export default App;
