const getPagination = (req: any) => {
  const page = parseInt(
    req.get("X-Pagination-Page") ||
      req.query.page ||
      (req.body ? req.body.page : 1) ||
      1,
    10,
  );
  const limit = parseInt(
    req.get("X-Pagination-Limit") ||
      req.query.limit ||
      (req.body ? req.body.limit : 50) ||
      50,
    10,
  );
  return {
    take: limit > 50 ? 50 : limit,
    skip: (page - 1) * limit,
  };
};
export default getPagination;
