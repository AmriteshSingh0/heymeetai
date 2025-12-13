import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants";

export const useMeetingsFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    status: parseAsString.withDefault("").withOptions({ clearOnDefault: true, }),
  })
};