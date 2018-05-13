const getPagination = (req: any) => {
  const page = +req.get("X-Pagination-Page") ||
    parseInt(req.query.page, 10) ||
    (req.body ? parseInt(req.body.page, 10) : 1) ||
    1;
  const limit = +req.get("X-Pagination-Limit") ||
    parseInt(req.query.limit, 10) ||
    (req.body ? parseInt(req.body.limit, 10) : 50) ||
    50;
  return {
    take: limit > 50 ? 50 : limit,
    skip: (page - 1) * limit,
  };
};
export default getPagination;
