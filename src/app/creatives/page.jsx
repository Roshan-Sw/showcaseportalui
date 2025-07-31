"use client";

import { useState, useEffect, useRef } from "react";
import { CreativesAPI } from "@/utils/Endpoints/Creatives";
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

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "BROCHURE", label: "Brochure" },
  { value: "LOGO", label: "Logo" },
].sort((a, b) => {
  if (a.value === "") return -1;
  if (b.value === "") return 1;
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
});

export default function Creatives() {
  const [creatives, setCreatives] = useState([]);
  const [totalCreatives, setTotalCreatives] = useState(0);
  const [searchParams, setSearchParams] = useState({
    search: "",
    type: "",
    page: 1,
    limit: 6,
  });
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchCreatives = async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await CreativesAPI.list({
          page: searchParams.page,
          limit: searchParams.limit,
          keyword: searchParams.search,
          type: searchParams.type || undefined,
        });
        const fetchedCreatives = response?.data?.data?.creatives || [];
        const fetchedTotal =
          response?.data?.data?.total || fetchedCreatives.length || 0;

        setCreatives((prev) =>
          searchParams.page === 1
            ? fetchedCreatives
            : [...prev, ...fetchedCreatives]
        );
        setTotalCreatives(fetchedTotal);
      } catch (error) {
        console.error("Error fetching creatives:", error);
        setCreatives([]);
        setTotalCreatives(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCreatives();
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          searchParams.page * searchParams.limit < totalCreatives
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
  }, [isLoading, totalCreatives, searchParams.page, searchParams.limit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleTypeChange = (selectedOption, { action }) => {
    setSearchParams((prev) => ({
      ...prev,
      type: selectedOption ? selectedOption.value : "",
      page: 1,
    }));
  };

  const selectedTypeOption =
    typeOptions.find(
      (opt) => String(opt.value) === String(searchParams.type)
    ) || typeOptions[0];

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
      <h1 className="text-3xl font-semibold text-center mb-6">Creatives</h1>
      <div
        className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between mb-4"
        autoComplete="off"
      >
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          value={searchParams.search}
          onChange={handleInputChange}
          className="border p-2 flex-1 rounded"
        />
        <div className="flex-1 min-w-0">
          <Select
            name="type"
            options={typeOptions}
            value={selectedTypeOption}
            onChange={handleTypeChange}
            isSearchable
            isClearable
            classNamePrefix="react-select"
            className="min-w-0"
            styles={{
              container: (base) => ({ ...base, width: "100%" }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
            placeholder="All Types"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(creatives) && creatives.length > 0 ? (
          creatives.map((item, index) => (
            <div
              key={item.id || index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={getThumbnailUrl(item)}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-gray-600">{item.type}</p>
                <p className="text-gray-600">
                  {item.created_at
                    ? formatDateDDMMYYYY(item.created_at)
                    : "No creation date"}
                </p>
                {item.file_public_url && (
                  <a
                    href={item.file_public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View File
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">No creatives available</div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {isLoading && (
        <div className="text-center my-4">Loading more creatives...</div>
      )}
      {searchParams.page * searchParams.limit >= totalCreatives &&
        creatives.length > 0 && (
          <div className="text-center my-4">No more creatives to load</div>
        )}
    </div>
  );
}
