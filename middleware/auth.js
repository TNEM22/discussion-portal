function protect(sessions, req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (sessionId != undefined && sessions[sessionId] != undefined) {
    next();
  } else {
    res.status(401).json('You are not authorized to access this endpoint.');
  }
}

module.exports = protect;
