import { get } from "@/utils/Config/config";

export const ClientsAPI = {
  list: (params = {}) =>
    get("clients/listing", {
      params: {
        page: params.page || 1,
        limit: params.limit || 100,
        keyword: params.keyword || "",
      },
    }),
};
