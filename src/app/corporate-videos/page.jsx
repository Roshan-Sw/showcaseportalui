"use client";

import { useState, useEffect, useRef } from "react";
import { VideosAPI } from "@/utils/Endpoints/Videos";
import { ClientsAPI } from "@/utils/Endpoints/Clients";
import { BASE_IMAGE_URL } from "@/services/baseUrl";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

function formatDateDDMMYYYY(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function CorporateVideos() {
  const [videos, setVideos] = useState([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [clients, setClients] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: "",
    client_id: "",
    format: "",
    page: 1,
    limit: 6,
    type: "CORPORATE_VIDEO",
  });
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const clientOptions = [
    { value: "", label: "All Clients" },
    ...[...clients]
      .sort((a, b) =>
        (a.client_name || "").localeCompare(b.client_name || "", undefined, {
          sensitivity: "base",
        })
      )
      .map((client) => ({
        value: String(client.id),
        label: client.client_name,
      })),
  ];

  const formatOptions = [
    { value: "", label: "All Formats" },
    { value: "LANDSCAPE", label: "Landscape" },
    { value: "PORTRAIT", label: "Portrait" },
    { value: "SQUARE", label: "Square" },
  ];

  const selectedClientOption =
    clientOptions.find(
      (opt) => String(opt.value) === String(searchParams.client_id)
    ) || clientOptions[0];

  const selectedFormatOption =
    formatOptions.find(
      (opt) => String(opt.value) === String(searchParams.format)
    ) || formatOptions[0];

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
        console.error("Error fetching corporate videos:", error);
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

  const handleClientChange = (selectedOption, { action }) => {
    setSearchParams((prev) => ({
      ...prev,
      client_id: selectedOption ? selectedOption.value : "",
      page: 1,
    }));
  };

  const handleFormatChange = (selectedOption, { action }) => {
    setSearchParams((prev) => ({
      ...prev,
      format: selectedOption ? selectedOption.value : "",
      page: 1,
    }));
  };

  const getThumbnailUrl = (item) => {
    if (item.thumbnail_public_url) return item.thumbnail_public_url;
    const thumbnail = item.thumbnail;
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
      <h1 className="text-3xl font-semibold text-center mb-6">
        Corporate Videos
      </h1>
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
        <div className="flex-1 min-w-0">
          <Select
            name="client_id"
            options={clientOptions}
            value={selectedClientOption}
            onChange={handleClientChange}
            isSearchable
            isClearable
            classNamePrefix="react-select"
            className="min-w-0"
            styles={{
              container: (base) => ({ ...base, width: "100%" }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
            placeholder="All Clients"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Select
            name="format"
            options={formatOptions}
            value={selectedFormatOption}
            onChange={handleFormatChange}
            isSearchable
            isClearable
            classNamePrefix="react-select"
            className="min-w-0"
            styles={{
              container: (base) => ({ ...base, width: "100%" }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
            placeholder="All Formats"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((item, index) => (
            <div
              key={item.id || index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={getThumbnailUrl(item)}
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
          <div className="col-span-3 text-center">
            No corporate videos available
          </div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {isLoading && (
        <div className="text-center my-4">Loading more corporate videos...</div>
      )}
      {searchParams.page * searchParams.limit >= totalVideos &&
        videos.length > 0 && (
          <div className="text-center my-4">
            No more corporate videos to load
          </div>
        )}
    </div>
  );
}
