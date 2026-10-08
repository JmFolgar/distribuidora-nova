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

/** Exige que el JWT tenga uno de los roles indicados (p. ej. ADMINISTRADOR). */
export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const rolesUsuario = req.user?.roles || [];
    const rolPrincipal = req.user?.rol;
    const tieneRol = rolesPermitidos.some(
      (r) => rolesUsuario.includes(r) || rolPrincipal === r
    );

    if (!tieneRol) {
      return res.status(403).json({
        success: false,
        message: "No tiene permisos para realizar esta acción.",
      });
    }

    next();
  };
}
