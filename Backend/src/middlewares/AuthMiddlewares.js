import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de acesso ausente",
    });
  }

  try {
    const token = authorization.slice(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token de acesso inválido ou expirado",
    });
  }
}
export async function validateUserLogin(req, res, next) {
  const user = userSchema.parse(req.body);

  req.body = user;

  const checkUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!checkUser) {
    return res.status(401).json({
      message: "Email ou senha inválidos",
    });
  }

  const checkPassword = await bcrypt.compare(
    user.password,
    checkUser.password
  );

  if (!checkPassword) {
    return res.status(401).json({
      message: "Email ou senha inválidos",
    });
  }

  req.user = {
    id: checkUser.id,
    email: checkUser.email,
    role: checkUser.role,
  };

  next();
}