import { config } from '../config'
import { prisma } from './prisma'

import Stripe from 'stripe'

export const stripe = new Stripe(config.stripe.secretKeyTest, {
  apiVersion: '2024-04-10',
  // Por estarmos usando bun é necessário passar o fetchHttpClient para o stripe, isso evita que aconteça algum tipo de problema nessa integração com o bun
  httpClient: Stripe.createFetchHttpClient()
})

export const getStripeCustomerByEmail = async (email: string) => {
  const customer = await stripe.customers.list({ email })
  // Eu quero o usuario que tem o email que eu passei
  return customer.data[0]
}

export const createStripeCustomer = async (input: {
  email: string
  // O name é opcional, porque no checkout session, a gente só passa o email, mas no user.controller precisamos passar o nome para criar o usuario no stripe
  name?: string
}) => {
  // Verificamos se existe um usuario com esse email no stripe
  const customer = await getStripeCustomerByEmail(input.email)

  // Se  tiver a gente retorna ele
  if (customer) return customer

  // Se não tiver, a gente cria um novo usuario no stripe
  return stripe.customers.create({
    email: input.email,
    name: input.name
  })
}

export const createCheckoutSession = async (
  userId: string,
  userEmail: string
) => {
  try {
    // Aqui a gente ja vai ter o usuario no stripe, por isso so passamos o email
    const customer = await createStripeCustomer({
      email: userEmail
    })

    const session = await stripe.checkout.sessions.create({
      // Somente cartão de crédito
      payment_method_types: ['card'],
      // Modo de pagamento, no caso é uma assinatura, com isso, o proprio stripe vai fazer a cobrança automaticamente todo mês
      mode: 'subscription',
      // O id que vem do nosso bd para o stripe, para identificar o usuário que esta criando essa sessão de checkout
      client_reference_id: userId,
      customer: customer.id,
      // se der certo ou se de errado vai para essas paginas
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      // Items no final do checkout, no caso o plano pro, passamos o id dele com as informações dele e a quantidade de 1
      line_items: [{ price: config.stripe.proPriceIdTest, quantity: 1 }]
    })

    return {
      // Retorna a url da sessão de checkout para realizar o pagamento
      url: session.url
    }
  } catch (err) {
    throw new Error('Error creating checkout session')
  }
}

export const handleProcessWebhookCheckout = async (event: {
  object: Stripe.Checkout.Session
}) => {
  // Esse é o id do usuario que criou a sessão de checkout, ou seja, o id do usuario no nosso bd
  const clientReferenceId = event.object.client_reference_id as string
  // Esse é o id do plano usuario
  const stripeSubscriptionId = event.object.subscription as string
  // Esse é o id do usuario la no stripe
  const stripeCustomerId = event.object.customer as string

  const checkoutStatus = event.object.status

  // Se o status do checkout não for completo, não faz nada
  if (checkoutStatus !== 'complete') return

  if (!clientReferenceId || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error(
      'clientReferenceId, stripeSubscriptionId, or stripeCustomerId not found, is required'
    )
  }

  // Verifica se o usuario existe no nosso bd.
  const userExists = await prisma.user.findUnique({
    where: {
      id: clientReferenceId
    },
    select: {
      id: true
    }
  })

  if (!userExists) {
    throw new Error('user of clientReferenceId not found')
  }

  // Atualiza o stripeCustomerId e o stripeSubscriptionId do usuario no nosso bd se o status do checkout for completo
  await prisma.user.update({
    where: {
      id: userExists.id
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId
    }
  })
}

export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id
  const stripeSubscriptionStatus = event.object.status

  // Verifica se o usuario existe no nosso bd, mas agora pelo stripeCustomerId ou stripeSubscriptionId, porque agora o usuario ja tem um stripeCustomerId, ou seja, um plano, logo o usuario no nosso bd ja tem um id do stripe. FindFirst primeiro usuario que encontrar
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          stripeCustomerId
        },
        {
          stripeSubscriptionId
        }
      ]
    },
    select: {
      id: true
    }
  })

  if (!userExists) {
    throw new Error('user of stripeCustomerId not found')
  }

  // Atualiza o stripeSubscriptionStatus do usuario no nosso bd, o status do plano do usuario
  await prisma.user.update({
    where: {
      id: userExists.id
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus
    }
  })
}
