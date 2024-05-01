import { prisma } from '../lib/prisma'

import type { Request, Response } from 'express'

export const createTodoController = async (req: Request, res: Response) => {
  // Pegando o id do usuário que está fazendo a requisição pelo header da requisição, diferente do corpo e dos parâmetros da URL
  const userId = req.headers['x-user-id']

  if (!userId) {
    return res.status(401).send({ message: 'Not authorized' })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId as string
    }
  })

  if (!user) {
    return res.status(401).send({ message: 'Not authorized' })
  }

  const { title, description } = req.body

  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      // user: {
      //   connect: {
      //     id: user.id
      //   }
      // }
      userId: user.id
    }
  })

  return res.status(201).send(todo)
}
