// Catches anything that falls through the routes (including thrown errors
// in async handlers if wrapped, and JSON body-parse failures) and makes
// sure we never leak stack traces or internals to the client.
export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}

export function errorHandler(err, req, res, next) {
  console.error("[unhandled error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Something went wrong. Please try again." : err.message,
  });
}
