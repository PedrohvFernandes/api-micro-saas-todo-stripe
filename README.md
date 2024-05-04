# Api Micro Saas agendador de tarefas(todo list), com sistema de pagamento integrado

### Anotações
 - O que é Micro Saas ? 
    - Conceito de Saas ? Software as a Service (SaaS) é um modelo de distribuição de software onde o software é hospedado por um fornecedor de serviços e disponibilizado para os clientes pela internet. Ou seja, software como serviço. Ex: Netflix, Spotify, Google Drive, etc. Plataformas que você paga para usar, onde ele resolve muitos problemas.
    - Micro Saas é um modelo de negócio onde você oferece um software como serviço, mas com um foco muito específico. Ex: Uma ferramenta de agendamento de reuniões, uma ferramenta de gestão de tarefas, etc. Ou seja, um serviço bem enxuto, com um foco bem específico, resolvendo um unico problema/dor/necessidade.
 - [O Que é Bun? Um Runtime Completo que Compete com o Node.js](https://kinsta.com/pt/blog/bun-sh/)
 - [Bun vs Node.js: Uma análise necessária](https://medium.com/@marquesag/bun-vs-node-js-o-que-você-precisa-saber-dc01456791a8#:~:text=Bun%20suporta%20TypeScript%20e%20JSX,dar%20suporte%20a%20essas%20funcionalidades.)
 - Como instalar o bun.js ?
    - `npm install -g bun`
- [Docs bun](https://bun.sh/docs/installation)
- Stripe é o maior gateway de pagamento do mundo, e é uma ferramenta que permite você receber pagamentos online. Aceitando mais de 135 moedas. E a integração dele é simplesmente fácil de fazer.
    - [Documentação Stripe](https://stripe.com/docs)
    - Instalar Stripe: ```bun add stripe``` or ```npm install stripe```
    - [Webhooks Stripe](https://docs.stripe.com/webhooks?locale=pt-BR)
      - [Interactive webhook endpoint builder](https://docs.stripe.com/webhooks/quickstart)
    - [Dashboard webhook: Criar webhook no stripe](https://dashboard.stripe.com/webhooks)
       - Ao clicar em *Adicione um endpoint* você consegue ter uma "colinha" de como criar um endpoint no stripe, para monitorar os eventos, e com o evento vem os tipos do evento como por exemplo quando o pagamento é confirmado, ex: ```checkout.session.completed```. No controller do stripe, tratamos o retorno do evento com a "colinha" do stripe. Quando terminar, basta subir a Api para o ar, colocar a url da api com a rota que possui o endpoint com os eventos, coloque os tipos de eventos que esse webhook vai escutar nesse endpoint para fins de indicar o que especificamente aquele webhook está monitorando, necessariamente não é preciso colocar, e o stripe vai começar a monitorar os eventos e enviar para a rota que você indicou, colocando no campo *URL do endpoint*, liste os tipos de eventos que serão escutados/monitorados e depois clique em *Adicionar endpoint*.
       - Ao clicar em *Teste em um ambiente local* você consegue testar o endpoint do stripe via cli do stripe localmente, para testar se o endpoint está funcionando corretamente, escutando os eventos, basta dizer para ele qual rota(endpoint) tem os webhooks. Antes baixe o stripe cli e logue com sua conta stripe usando o cli do stripe. E depois o comando abaixo indicando a rota(endpoint) da nossa api que vai processar o webhook.
         - Ex: ```stripe listen --forward-to localhost:3000/stripe```
          - Ao rodar, ele te enviara um id do webhook, onde você utiliza para testar o webhook, passando para o constructEvent do stripe(stripe controller), para construir o evento e testar se está funcionando corretamente. E com isso, você deixa o terminal do stripe aberto, se você voltar para o dashboard de webhooks vai ver que agora tem ouvintes locais, vai ter o nome do PC/notebook, localhost:3000/stripe, versão e o status ativo. Com a cli do stripe aberto podemos acompanhar todos os tipos de eventos ocorrendo. Obs: deixe a cli aberta, se fechar, depois de um tempo o status fica como desconectado.
         - [Stripe CLI](https://docs.stripe.com/stripe-cli)
          - No windows é configuração avançada do sistema>variáveis de ambiente>path>Editar>Editar>adicionar o caminho do stripe.exe cli
         - E lembrando a aplicação deve estar no ar via local, com ```bun dev```

 ### Tecnologias:

 - Stripe
 - Bun.js
  - Node.js
- Express
- Prisma
- Stripe
- Typescript
- Husky
- Eslint
- Prettier
- Lint Staged
- git commit msg linter

### Fluxo do sistema

- [Fluxo do sistema](https://excalidraw.com/#json=zMZvG63BX4r7YUcLeZ4qY,RNRGBuhKwQvYd1pml92hJg)
<img src="./.github/fluxo-do-sistema.png">

## 👨‍💻 Autor:

- Linkedin: https://www.linkedin.com/in/pedro-henrique-vieira-fernandes
- Git: https://github.com/PedrohvFernandes
- Instagram: pedro17fernandes
- portfolio: https://pedrohvfernandes-web-page-portfolio.vercel.app