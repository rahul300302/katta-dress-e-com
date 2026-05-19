export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
