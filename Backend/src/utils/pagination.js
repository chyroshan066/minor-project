function getPagination({ page = 1, limit = 20 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;
  return { limit: safeLimit, page: safePage, offset };
}

module.exports = { getPagination };

