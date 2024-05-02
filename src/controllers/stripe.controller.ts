import { config } from '../config'
import {
  handleProcessWebhookCheckout,
  handleProcessWebhookUpdatedSubscription,
  stripe
} from '../lib/stripe'

import type { Request, Response } from 'express'
import Stripe from 'stripe'

export const stripeWebhookController = async (req: Request, res: Response) => {
  let event: Stripe.Event = req.body

  // Se a chave secreta do webhook do stripe não estiver setada, retorna erro
  if (!config.stripe.webhookSecret) {
    console.error('Stripe secret key not set')
    return res.sendStatus(400)
  }

  // Verifica se a assinatura do stripe é válida
  const stripeSignature = req.headers['stripe-signature'] as string

  try {
    // Constrói o evento
    // event = stripe.webhooks.constructEvent(
    // Por estar usando o bun precisamos fazer assim:
    event = await stripe.webhooks.constructEventAsync(
      req.body,
      stripeSignature,
      config.stripe.webhookSecret,
      // No bun precisamos passar isso
      undefined,
      Stripe.createSubtleCryptoProvider()
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Error verifying Stripe webhook: ${errorMessage}`)
    return res.sendStatus(400)
  }

  try {
    // Dentro do evento possui o tipo do evento que foi disparado e nós o tratamos eles.
    switch (event.type) {
      // Quando o checkout é completado
      case 'checkout.session.completed':
        await handleProcessWebhookCheckout(event.data)
        break
      // Quando a assinatura é criada ou atualizada
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleProcessWebhookUpdatedSubscription(event.data)
        break
      default:
        // Aqui seria os eventos que não estamos tratando e que podem acontecer
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.json({ received: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Error processing Stripe webhook: ${errorMessage}`)
    return res.status(500).send(`Webhook Error: ${errorMessage}`)
  }
}
