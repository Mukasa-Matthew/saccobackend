const notFound = (req, res, next) => {
  // Don't log errors for favicon and robots.txt
  if (req.originalUrl.includes('favicon.ico') || req.originalUrl.includes('robots.txt')) {
    return res.status(204).end();
  }
  
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;

