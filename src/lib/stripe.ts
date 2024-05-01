import { config } from '../config'

import Stripe from 'stripe'

export const stripe = new Stripe(config.stripe.secretKeyTest, {
  apiVersion: '2024-04-10'
})

export const createCheckoutSession = async (userId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      // Somente cartão de crédito
      payment_method_types: ['card'],
      // Modo de pagamento, no caso é uma assinatura, com isso, o proprio stripe vai fazer a cobrança automaticamente todo mês
      mode: 'subscription',
      // O id que vem do nosso bd para o stripe, para identificar o usuário que esta criando essa sessão de checkout
      client_reference_id: userId,
      // se der certo ou se de errado vai para essas paginas
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      // Items no final do checkout, no caso o plano pro, passamos o id dele com as informações dele e a quantidade de 1
      line_items: [{ price: config.stripe.proPriceId, quantity: 1 }]
    })

    return {
      // Retorna a url da sessão de checkout, se deu errado ou certo
      url: session.url
    }
  } catch (err) {
    console.log('Error on generate checkout', err)
  }
}

export const handleProcessWebhookCheckout = () => {}

export const handleProcessWebhookUpdatedSubscription = () => {}
