"use client";

import { useState, useEffect, useRef } from "react";
import { VideosAPI } from "@/utils/Endpoints/Videos";
import { ClientsAPI } from "@/utils/Endpoints/Clients";
import { BASE_IMAGE_URL } from "@/services/baseUrl";

function formatDateDDMMYYYY(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Reels() {
  const [videos, setVideos] = useState([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [clients, setClients] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: "",
    client_id: "",
    format: "",
    page: 1,
    limit: 6,
    type: "REEL",
  });
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await ClientsAPI.list();
        const fetchedClients =
          response?.data?.data?.clients || response?.data || [];
        setClients(fetchedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await VideosAPI.listing({
          page: searchParams.page,
          limit: searchParams.limit,
          keyword: searchParams.search,
          client_id: searchParams.client_id
            ? Number(searchParams.client_id)
            : undefined,
          type: searchParams.type,
          format: searchParams.format || undefined,
        });
        const fetchedVideos =
          response?.data?.data?.videos || response?.data || [];
        const fetchedTotal =
          response?.data?.data?.total || fetchedVideos.length || 0;

        setVideos((prev) =>
          searchParams.page === 1 ? fetchedVideos : [...prev, ...fetchedVideos]
        );
        setTotalVideos(fetchedTotal);
      } catch (error) {
        console.error("Error fetching reels:", error);
        setVideos([]);
        setTotalVideos(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          searchParams.page * searchParams.limit < totalVideos
        ) {
          setSearchParams((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, totalVideos, searchParams.page, searchParams.limit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "/placeholder.jpg";

    if (/^https?:\/\//i.test(thumbnail)) return thumbnail;

    if (typeof BASE_IMAGE_URL === "string" && BASE_IMAGE_URL) {
      return `${BASE_IMAGE_URL.replace(/\/$/, "")}/${thumbnail.replace(
        /^\//,
        ""
      )}`;
    }

    return `/${thumbnail.replace(/^\//, "")}`;
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Our Reels</h1>
      <div
        className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between mb-4"
        autoComplete="off"
      >
        <input
          type="text"
          name="search"
          placeholder="Search by tags"
          value={searchParams.search}
          onChange={handleInputChange}
          className="border p-2 flex-1 rounded"
        />
        <select
          name="client_id"
          value={searchParams.client_id}
          onChange={handleInputChange}
          className="border p-2 flex-1 rounded"
        >
          <option value="">All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.client_name}
            </option>
          ))}
        </select>
        <select
          name="format"
          value={searchParams.format}
          onChange={handleInputChange}
          className="border p-2 flex-1 rounded"
        >
          <option value="">All Formats</option>
          <option value="LANDSCAPE">Landscape</option>
          <option value="PORTRAIT">Portrait</option>
          <option value="SQUARE">Square</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((item, index) => (
            <div
              key={item.id || index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={getThumbnailUrl(item.thumbnail)}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-gray-600">
                  {item.created_at
                    ? formatDateDDMMYYYY(item.created_at)
                    : "No creation date"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">No reels available</div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {isLoading && (
        <div className="text-center my-4">Loading more reels...</div>
      )}
      {searchParams.page * searchParams.limit >= totalVideos &&
        videos.length > 0 && (
          <div className="text-center my-4">No more reels to load</div>
        )}
    </div>
  );
}
