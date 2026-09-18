import z from "zod";
import { prisma } from "../database/prisma.js";

const taskFields = {
  title: z
    .string("O título é obrigatório")
    .trim()
    .min(1, "O título é obrigatório")
    .max(50, "O título deve ter no máximo 50 caracteres"),
  description: z
    .string()
    .max(30, "A descrição deve ter no máximo 30 caracteres")
    .optional(),
  category: z.enum(["Estudos", "React", "Prática"], {
    message: "A categoria deve ser Estudos, React ou Prática",
  }),
  priority: z.enum(["Baixa", "Média", "Alta"], {
    message: "A prioridade deve ser Baixa, Média ou Alta",
  }),
};

const taskIdSchema = z.string().uuid("O identificador da tarefa é inválido");

async function findTask(id, res) {
  const parsedId = taskIdSchema.safeParse(id);
  if (!parsedId.success) {
    res.status(400).json({ message: "O identificador da tarefa é inválido" });
    return null;
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    res.status(404).json({ message: "Tarefa não encontrada" });
    return null;
  }

  return task;
}


class TaskMiddlewares {
  async validadateCreate(req, res, next) {
    const taskSchema = z.object({
      title: taskFields.title,
      description: taskFields.description,
      category: taskFields.category.default("Estudos"),
      priority: taskFields.priority.default("Média"),
    }).strict();
    req.body = taskSchema.parse(req.body);
    next();
  }
  async validadateUpdate(req, res, next) {
    const taskSchema = z.object({
      title: taskFields.title.optional(),
      description: taskFields.description,
      category: taskFields.category.optional(),
      priority: taskFields.priority.optional(),
    }).strict();
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Nenhuma informação foi enviada" });
    }
    req.body = taskSchema.parse(req.body);
    const task = await findTask(req.params.id, res);
    if (!task) return;
    next();
  }
  async validadate(req, res, next) {
    const task = await findTask(req.params.id, res);
    if (!task) return;
    next();
  }

  async validateFavorite(req, res, next) {
    req.body = z.object({ favorite: z.boolean() }).strict().parse(req.body);
    const task = await findTask(req.params.id, res);
    if (!task) return;
    next();
  }

  async validateCompleted(req, res, next) {
    req.body = z.object({ completed: z.boolean() }).strict().parse(req.body);
    const task = await findTask(req.params.id, res);
    if (!task) return;
    next();
  }


}
export default new TaskMiddlewares();
