import jwt from "jsonwebtoken";

// Simple JWT auth middleware.
export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    console.error("JWT verification failed", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

