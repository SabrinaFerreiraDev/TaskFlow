import { prisma } from '../database/prisma.js'

async function updateOwnedTask(id, userId, data) {
   const result = await prisma.task.updateMany({ where: { id, userId }, data })
   if (!result.count) return null
   return prisma.task.findFirst({ where: { id, userId } })
}

class TaskFlow{
   async ListTask(req, res){
      const tasks = await prisma.task.findMany({ where: { userId: req.user.id } })
      return res.json(tasks)
   }
   async CreateTask(req, res) {
       const {title, description, category, priority} = req.body
      const task = await prisma.task.create({
         data: {
            userId: req.user.id,
            title,
            description,
            category,
            priority
         }
      })
      return res.json(task)
   }
   async UpdateTask(req, res) {
      const {id} = req.params
      const task = await updateOwnedTask(id, req.user.id, req.body)
      if (!task) return res.status(404).json({ message: "Tarefa n\u00e3o encontrada" })
      return res.json(task)
   }
   async addfavorite(req, res) {
      const { id } = req.params
      const task = await updateOwnedTask(id, req.user.id, { favorite: req.body.favorite })
      if (!task) return res.status(404).json({ message: "Tarefa n\u00e3o encontrada" })
      return res.json(task)
   }
   async CompleteTask(req, res) {
      const {id} = req.params
      const task = await updateOwnedTask(id, req.user.id, { completed: req.body.completed })
      if (!task) return res.status(404).json({ message: "Tarefa n\u00e3o encontrada" })
      return res.json(task)
   }
   async DeleteTask(req, res) {
      const {id} = req.params
      const result = await prisma.task.deleteMany({ where: { id, userId: req.user.id } })
      if (!result.count) {
         return res.status(404).json({message: "Task not found"})
      }
      return res.status(204).send()
   }
}

export default new TaskFlow();
