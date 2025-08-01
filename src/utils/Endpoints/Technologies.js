import { get } from "@/utils/Config/config";

export const TechnologiesAPI = {
  list: (params = {}) =>
    get("technologies/listing", {
      params: {
        page: params.page || 1,
        limit: params.limit || 1000,
        keyword: params.keyword || "",
      },
    }),
};
