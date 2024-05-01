import { prisma } from '../lib/prisma'
import { createCheckoutSession } from '../lib/stripe'

import type { Request, Response } from 'express'

export const createCheckoutController = async (req: Request, res: Response) => {
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

  const checkout = await createCheckoutSession(user.id)

  return res.status(201).send(checkout)
}
