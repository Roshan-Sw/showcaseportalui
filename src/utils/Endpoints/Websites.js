import { get } from "@/utils/Config/config";

export const WebsitesAPI = {
  list: (params = {}) =>
    get("websites/listing", {
      params: {
        page: params.page || 1,
        limit: params.limit || 6,
        keyword: params.keyword || "",
        client_id: params.client_id || undefined,
        technology_id: params.technology_id || undefined,
        type: params.type || undefined,
      },
    }),
  getWebsiteDetails: (id) => get(`websites/${id}`),
};
