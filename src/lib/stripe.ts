import { config } from '../config'

import Stripe from 'stripe'

export const stripe = new Stripe(config.stripe.secretKeyTest, {
  apiVersion: '2024-04-10'
})
