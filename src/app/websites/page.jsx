"use client";

import { useState, useEffect, useRef } from "react";
import { WebsitesAPI } from "@/utils/Endpoints/Websites";
import { ClientsAPI } from "@/utils/Endpoints/Clients";
import { TechnologiesAPI } from "@/utils/Endpoints/Technologies";
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

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [totalWebsites, setTotalWebsites] = useState(0);
  const [clients, setClients] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: "",
    client_id: "",
    technology_id: "",
    page: 1,
    limit: 6,
    type: "WEBSITE",
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
    const fetchWebsites = async () => {
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
        const fetchedWebsites =
          response?.data?.data?.websites || response?.data || [];
        const fetchedTotal =
          response?.data?.data?.total || fetchedWebsites.length || 0;

        setWebsites((prev) =>
          searchParams.page === 1
            ? fetchedWebsites
            : [...prev, ...fetchedWebsites]
        );
        setTotalWebsites(fetchedTotal);
      } catch (error) {
        console.error("Error fetching websites:", error);
        setWebsites([]);
        setTotalWebsites(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWebsites();
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          searchParams.page * searchParams.limit < totalWebsites
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
  }, [isLoading, totalWebsites, searchParams.page, searchParams.limit]);

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
      <h1 className="text-3xl font-semibold text-center mb-6">Our Websites</h1>
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
          name="technology_id"
          value={searchParams.technology_id}
          onChange={handleInputChange}
          className="border p-2 flex-1 rounded"
        >
          <option value="">All Technologies</option>
          {technologies.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(websites) && websites.length > 0 ? (
          websites.map((item, index) => (
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
                  {item.launch_date
                    ? formatDateDDMMYYYY(item.launch_date)
                    : "No launch date"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center">No websites available</div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
      {isLoading && (
        <div className="text-center my-4">Loading more websites...</div>
      )}
      {searchParams.page * searchParams.limit >= totalWebsites &&
        websites.length > 0 && (
          <div className="text-center my-4">No more websites to load</div>
        )}
    </div>
  );
}
