interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface ParsedPagination {
  skip: number;
  limit: number;
  page: number;
}

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

/**
 * Parses pagination query params into skip/limit values.
 * Clamps limit to MAX_LIMIT and ensures page >= 1.
 */
export function parsePagination(query: PaginationQuery): ParsedPagination {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { skip, limit, page };
}

/**
 * Builds pagination metadata from total count and current position.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
