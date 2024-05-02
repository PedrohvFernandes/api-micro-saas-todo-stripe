import { createCheckoutController } from './controllers/checkout.controller'
import { stripeWebhookController } from './controllers/stripe.controller'
import { createTodoController } from './controllers/todo.controller'
import {
  createUserController,
  findOneUserController,
  listUsersController
} from './controllers/user.controller'

import express from 'express'

const app = express()
const port = 3000

// Rota(endpoint) para receber os eventos do stripe, os webhooks. O stripe não usa JSON para webhook, por isso colocamos ela antes do middleware que transforma o corpo da requisição em JSON. E colocamos o express.raw({ type: 'application/json' }) Retorna um middleware que analisa todos os corpos como um Buffer e analisa apenas as solicitações em que o cabeçalho Content-Type corresponde à opção de tipo.
app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookController
)

// Um middleware que transforma o corpo da requisição em JSON
app.use(express.json())

// Pode fazer assim
// app.get('/users', (req, res) => {
//   listUsersController(req, res)
// })

// Ou assim:
app.get('/users', listUsersController)
app.post('/users', createUserController)
app.get('/users/:userId', findOneUserController)

app.post('/todos', createTodoController)

app.post('/checkout', createCheckoutController)

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
