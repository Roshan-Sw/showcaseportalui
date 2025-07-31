import { get } from "@/utils/Config/config";

export const CreativesAPI = {
  list: (params = {}) =>
    get("creatives/listing", {
      params: {
        page: params.page || 1,
        limit: params.limit || 6,
        keyword: params.keyword || "",
        type: params.type || undefined,
      },
    }),
  getCreativeDetails: (id) => get(`creatives/${id}`),
};
