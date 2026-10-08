import jwt from "jsonwebtoken";

const JWT_SECRET = () => process.env.JWT_SECRET || "nova-dev-secret-change-me";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: "8h" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Sesión no válida. Inicie sesión nuevamente.",
    });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET());
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Sesión expirada o no válida. Inicie sesión nuevamente.",
    });
  }
}
