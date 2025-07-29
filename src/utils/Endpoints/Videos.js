import { get } from "@/utils/Config/config";

export const VideosAPI = {
  listing: (params = {}) =>
    get("videos/listing", {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        keyword: params.keyword || "",
        client_id: params.client_id || undefined,
        type: params.type || undefined,
        format: params.format || undefined,
      },
    }),
};
