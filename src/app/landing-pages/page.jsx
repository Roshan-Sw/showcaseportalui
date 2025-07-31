"use client";

import { useState, useEffect, useRef } from "react";
import { WebsitesAPI } from "@/utils/Endpoints/Websites";
import { ClientsAPI } from "@/utils/Endpoints/Clients";
import { TechnologiesAPI } from "@/utils/Endpoints/Technologies";
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

export default function LandingPages() {
  const [landingPages, setLandingPages] = useState([]);
  const [totalLandingPages, setTotalLandingPages] = useState(0);
  const [clients, setClients] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: "",
    client_id: "",
    technology_id: "",
    page: 1,
    limit: 6,
    type: "LANDING_PAGE",
  });
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const clientOptions = [
    { value: "", label: "All Clients" },
    ...[...(clients || [])]
      .slice()
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

  const technologyOptions = [
    { value: "", label: "All Technologies" },
    ...[...(technologies || [])]
      .slice()
      .sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        })
      )
      .map((tech) => ({
        value: String(tech.id),
        label: tech.name,
      })),
  ];

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
    const fetchTechnologies = async () => {
      try {
        const response = await TechnologiesAPI.list();
        const fetchedTechnologies =
          response?.data?.data?.technologies || response?.data || [];
        setTechnologies(fetchedTechnologies);
      } catch (error) {
        console.error("Error fetching technologies:", error);
        setTechnologies([]);
      }
    };
    fetchTechnologies();
  }, []);

  useEffect(() => {
    const fetchLandingPages = async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await WebsitesAPI.list({
          page: searchParams.page,
          limit: searchParams.limit,
          keyword: searchParams.search,
          client_id: searchParams.client_id
            ? Number(searchParams.client_id)
            : undefined,
          technology_id: searchParams.technology_id
            ? Number(searchParams.technology_id)
            : undefined,
          type: searchParams.type,
        });
        const fetchedLandingPages =
          response?.data?.data?.websites || response?.data || [];
        const fetchedTotal =
          response?.data?.data?.total || fetchedLandingPages.length || 0;

        setLandingPages((prev) =>
          searchParams.page === 1
            ? fetchedLandingPages
            : [...prev, ...fetchedLandingPages]
        );
        setTotalLandingPages(fetchedTotal);
      } catch (error) {
        console.error("Error fetching landing pages:", error);
        setLandingPages([]);
        setTotalLandingPages(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandingPages();
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          searchParams.page * searchParams.limit < totalLandingPages
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
  }, [isLoading, totalLandingPages, searchParams.page, searchParams.limit]);

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

  const handleTechnologyChange = (selectedOption, { action }) => {
    setSearchParams((prev) => ({
      ...prev,
      technology_id: selectedOption ? selectedOption.value : "",
      page: 1,
    }));
  };

  const selectedClientOption =
    clientOptions.find(
      (opt) => String(opt.value) === String(searchParams.client_id)
    ) || clientOptions[0];

  const selectedTechnologyOption =
    technologyOptions.find(
      (opt) => String(opt.value) === String(searchParams.technology_id)
    ) || technologyOptions[0];

  const getThumbnailUrl = (item) => {
    if (item.thumbnail_presigned_url) return item.thumbnail_presigned_url;
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
      <h1 className="text-3xl font-semibold text-center mb-6">Landing Pages</h1>
      <div
        className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between mb-4"
        autoComplete="off"
      >
        <input
          type="text"
          name="search"
          placeholder="Search by title"
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
            name="technology_id"
            options={technologyOptions}
            value={selectedTechnologyOption}
            onChange={handleTechnologyChange}
            isSearchable
            isClearable
            classNamePrefix="react-select"
            className="min-w-0"
            styles={{
              container: (base) => ({ ...base, width: "100%" }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
            placeholder="All Technologies"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(landingPages) && landingPages.length > 0 ? (
          landingPages.map((item, index) => (
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
                  {item.launch_date
                    ? formatDateDDMMYYYY(item.launch_date)
                    : "No launch date"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">
            No landing pages available
          </div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {isLoading && (
        <div className="text-center my-4">Loading more landing pages...</div>
      )}
      {searchParams.page * searchParams.limit >= totalLandingPages &&
        landingPages.length > 0 && (
          <div className="text-center my-4">No more landing pages to load</div>
        )}
    </div>
  );
}
