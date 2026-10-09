import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../database/prisma.js";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail v\u00e1lido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(128),
}).strict();

function jwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET n\u00e3o foi configurado");
  return process.env.JWT_SECRET;
}

export function validateCredentials(req, res, next) {
  req.body = credentialsSchema.parse(req.body);
  next();
}

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de acesso ausente",
    });
  }

  try {
    const token = authorization.slice(7);

    const payload = jwt.verify(token, jwtSecret(), {
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
  const checkUser = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!checkUser) {
    return res.status(401).json({
      message: "Email ou senha inválidos",
    });
  }

  const checkPassword = await bcrypt.compare(
    req.body.password,
    checkUser.password
  );

  if (!checkPassword) {
    return res.status(401).json({
      message: "Email ou senha inválidos",
    });
  }

  req.user = checkUser;

  next();
}
