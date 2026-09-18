import { prisma } from '../database/prisma.js'
class TaskFlow{
   async ListTask(req, res){
      const tasks = await prisma.task.findMany()
      return res.json(tasks)
   }
   async CreateTask(req, res) {
       const {title, description, category, priority} = req.body
      const task = await prisma.task.create({
         data: {
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
      const task = await prisma.task.update({
        where: {
          id,
        },
            data: req.body,
      });
      return res.json(task)
   }
   async addfavorite(req, res) {
      const { id } = req.params
      const task = await prisma.task.update({
        where: {
          id,
        },
            data: { favorite: req.body.favorite },
      });
      return res.json(task)
   }
   async CompleteTask(req, res) {
      const {id} = req.params
      const task = await prisma.task.update({
         where: {
            id
         },
         data: { completed: req.body.completed }
      })
      return res.json(task)
   }
   async DeleteTask(req, res) {
      const {id} = req.params
      const task = await prisma.task.delete({
         where: {
            id
         }
      })
      if(!task){
         return res.status(404).json({message: "Task not found"})
      }
      return res.json(task)
   }
}

export default new TaskFlow();
