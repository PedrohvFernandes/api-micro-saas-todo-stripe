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
    },
    select: {
      id: true,
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      // Contamos todos os todos que o usuario tem
      _count: {
        select: {
          todos: true
        }
      }
    }
  })

  if (!user) {
    return res.status(401).send({ message: 'Not authorized' })
  }

  // Quantidade disponivel para fazer tarefas de graça
  const hasQuotaAvailable = user._count.todos < 5
  // Se o usuário tem uma assinatura ativa, ou seja, um id e o status contando como ativo ele tem um plano ativo
  const hasActivesSubscription =
    user.stripeSubscriptionId && user.stripeSubscriptionStatus === 'active'

  // Se não tem cota e nem assinatura ativa, não pode criar uma nova tarefa
  if (!hasQuotaAvailable && !hasActivesSubscription) {
    return res
      .status(403)
      .send({ message: 'Not quota available. Please upgrade your plan' })
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
