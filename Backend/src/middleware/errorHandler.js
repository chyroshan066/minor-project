const { ApiError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const message = isApiError ? err.message : 'Internal server error';

  if (!isApiError) {
    // Avoid leaking details; log minimal error server-side
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const payload = { error: message };
  if (isApiError && err.details) payload.details = err.details;

  res.status(status).json(payload);
}

module.exports = { errorHandler };
