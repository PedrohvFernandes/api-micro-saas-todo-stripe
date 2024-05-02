import { prisma } from '../lib/prisma'
import { createStripeCustomer } from '../lib/stripe'

import type { Request, Response } from 'express'

export const listUsersController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()

  res.send(users)
}

export const findOneUserController = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    return res.status(404).send({ message: 'User not found' })
  }

  res.send(user)
}

export const createUserController = async (req: Request, res: Response) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).send({ message: 'Name and email are required' })
  }

  const userEmailAlreadyExists = await prisma.user.findFirst({
    where: {
      email
    },
    select: {
      id: true
    }
  })

  if (userEmailAlreadyExists) {
    return res.status(400).send({ message: 'Email already exists' })
  }

  // Ja cria o usuario no stripe
  const stripeCustomer = await createStripeCustomer({
    email,
    name
  })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      // Salva o id do stripe do usuario no nosso bd, mesmo que o usuario nao tenha um plano ainda
      stripeCustomerId: stripeCustomer.id
    }
  })

  res.send(user)
}
