class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(message = 'Not found') {
  return new ApiError(404, message);
}

function badRequest(message = 'Bad request', details) {
  return new ApiError(400, message, details);
}

function unauthorized(message = 'Unauthorized') {
  return new ApiError(401, message);
}

function forbidden(message = 'Forbidden') {
  return new ApiError(403, message);
}

module.exports = { ApiError, notFound, badRequest, unauthorized, forbidden };
