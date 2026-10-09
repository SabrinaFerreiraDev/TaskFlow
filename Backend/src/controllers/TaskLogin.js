import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role };
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET n\u00e3o foi configurado");
  return process.env.JWT_SECRET;
}

export async function register(req, res) {
  const { email, password } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(409).json({ message: "Este e-mail j\u00e1 est\u00e1 cadastrado" });

  const user = await prisma.user.create({
    data: { email, password: await bcrypt.hash(password, 12) },
  });

  return res.status(201).json({ message: "Conta criada com sucesso", user: publicUser(user) });
}

export function login(req, res) {
  const user = req.user;
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: "5h" },
  );

  return res.status(200).json({ message: "Login realizado com sucesso", accessToken, user: publicUser(user) });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(401).json({ message: "Token de acesso inv\u00e1lido ou expirado" });
  return res.json(publicUser(user));
}
