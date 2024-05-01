import { createCheckoutController } from './controllers/checkout.controller'
import { createTodoController } from './controllers/todo.controller'
import {
  createUserController,
  findOneUserController,
  listUsersController
} from './controllers/user.controller'

import express from 'express'

const app = express()
const port = 3000

// Um middleware que transforma o corpo da requisição em JSON
app.use(express.json())

app.get('/users', (req, res) => {
  listUsersController(req, res)
})
app.post('/users', (req, res) => {
  createUserController(req, res)
})
app.get('/users/:userId', (req, res) => {
  findOneUserController(req, res)
})

app.post('/todos', (req, res) => {
  createTodoController(req, res)
})

app.post('/checkout', (req, res) => {
  createCheckoutController(req, res)
})

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
