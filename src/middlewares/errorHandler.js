// Handler de erro para retornar status 500 e o motivo do erro, caso seja usado o ambiente de desenvolviemnto

export function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}