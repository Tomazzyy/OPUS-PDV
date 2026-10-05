# OpusPDV

Frente de caixa (PDV) feita para o teste prático: o operador busca produtos, monta o carrinho, recebe o pagamento e consulta vendas já finalizadas. O backend é uma API em Laravel e o frontend é um React com TypeScript que consome essa API.

> **Um aviso honesto:** comecei pelo que o enunciado pedia, mas acabei me empolgando e fui além do escopo. Entraram login com perfis de operador e administrador, uma tela de admin para cadastrar produtos (com foto por upload ou link), ajuste de estoque, fechamento do caixa por dia e um comprovante pronto para impressora térmica. Tentei manter tudo simples e coerente com as regras do teste, mas fica registrado que esses extras não foram pedidos.

## Stack

- **Backend:** PHP 8.3+, Laravel 13, Laravel Sanctum (autenticação por token)
- **Frontend:** React 19, TypeScript, Vite
- **Banco:** SQLite por padrão (zero configuração), com suporte a MySQL/MariaDB
- **Ícones:** lucide-react

## Como rodar

Você vai precisar de **PHP 8.3+**, **Composer** e **Node 20.19+** instalados.

### 1. Backend

```bash
cd backend
composer setup
php artisan serve
```

O `composer setup` faz tudo de uma vez: instala as dependências, cria o `.env`, gera a chave da aplicação, cria o banco SQLite em `database/database.sqlite`, roda as migrations e popula com os dados de exemplo.

A API fica em `http://localhost:8000`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite já repassa as chamadas de `/api` para o Laravel, então não precisa configurar URL nem CORS.

### Acessos

| Perfil | E-mail | Senha | O que vê |
|---|---|---|---|
| Operador | `operador@pdv.com` | `op123` | Caixa e Vendas |
| Administrador | `adm@admin.com` | `admin123` | Caixa, Vendas e Produtos |

### Dados de exemplo

O seeder cria 17 produtos de lanchonete, com foto, e alguns casos de propósito para testar as regras na mão:

- **Batata Frita Grande** (`2006`): só 3 unidades, para testar "Estoque insuficiente".
- **Sorvete de Casquinha** (`3004`): estoque zerado.
- **Milk-shake** (`3005`): inativo, não aparece no caixa nem pode ser vendido.

Os códigos são curtos para facilitar: 1xxx bebidas, 2xxx lanches, 3xxx salgados e doces. Digite o código na busca e aperte **Enter** para adicionar direto ao carrinho, como faria um leitor de código de barras.

Para recriar o banco do zero: `php artisan migrate:fresh --seed`.

### Usando MySQL em vez de SQLite

No `backend/.env`, troque `DB_CONNECTION=sqlite` por `DB_CONNECTION=mysql`, descomente as linhas de conexão logo abaixo, crie um banco vazio chamado `opuspdv` e rode `php artisan migrate --seed`.

Vale saber: o bloqueio de estoque contra vendas simultâneas (mais abaixo) só tem efeito no MySQL. No SQLite, que é o padrão para facilitar a avaliação, ele é ignorado. Para uma pessoa testando sozinha, não faz diferença.

## Testes

```bash
cd backend
php artisan test
```

São 39 testes de feature, que rodam em SQLite em memória e não mexem no banco local. Eles cobrem as regras que importam:

- cálculo de subtotal e total, com o preço vindo do banco mesmo quando o cliente manda outro valor;
- produto inexistente, produto inativo e estoque insuficiente;
- pagamento em dinheiro insuficiente e cálculo do troco;
- snapshot do preço (a venda antiga continua com o preço antigo);
- venda finalizada que não pode ser alterada;
- rollback quando algo falha no meio da venda;
- login, rotas protegidas e permissão de admin;
- fechamento do dia, inclusive uma venda às 23h30 caindo no dia certo;
- cadastro de produto, ajuste de estoque e upload de foto.

## API

Todas as rotas, menos o login, exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/login` | Login (limite de 5 tentativas por minuto) |
| POST | `/api/logout` | Encerra a sessão |
| GET | `/api/me` | Usuário logado |
| GET | `/api/products?search=coca` | Produtos ativos, com busca por nome ou código |
| GET | `/api/products/{id}` | Um produto |
| POST | `/api/sales` | Finaliza uma venda |
| GET | `/api/sales?date=2026-10-02` | Vendas do dia (padrão: hoje) |
| GET | `/api/sales/summary?date=2026-10-02` | Fechamento do dia por forma de pagamento |
| GET | `/api/sales/{id}` | Uma venda com os itens |

Rotas de administrador (`/api/admin/...`, respondem 403 para operador):

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/products` | Todos os produtos, inclusive inativos |
| POST | `/api/admin/products` | Cadastra produto |
| PATCH | `/api/admin/products/{id}` | Edita nome, código, preço e disponibilidade |
| POST | `/api/admin/products/{id}/stock` | Ajusta o estoque (`{"quantity": 10}` ou `-3`) |
| POST | `/api/admin/products/{id}/image` | Define a foto (arquivo `image` ou `image_url`) |
| DELETE | `/api/admin/products/{id}/image` | Remove a foto |

Exemplo de venda. O frontend só manda a intenção:

```json
{
  "items": [{ "product_id": 1, "quantity": 2 }],
  "payment_method": "cash",
  "amount_received_cents": 5000
}
```

## Decisões técnicas

**Dinheiro em centavos.** Todo valor monetário é um inteiro em centavos (`R$ 10,50` vira `1050`), no banco, na API e no estado do React. Nada de `float`, então não há erro de arredondamento. A conversão para reais só acontece na hora de exibir.

**O backend é a fonte da verdade.** O cliente pode mandar qualquer coisa, então a API ignora preço, subtotal, total e troco que vierem na requisição. O `SaleService` busca os produtos no banco, confere se existem e se estão ativos, verifica o estoque, calcula tudo com o preço do banco, valida o pagamento e calcula o troco. O total que aparece no carrinho é só uma prévia: o comprovante mostra sempre o valor que o backend gravou.

**Snapshot do produto na venda.** O item da venda guarda uma cópia do nome, do código e do preço do produto naquele momento. Se a Coca-Cola subir de R$ 5,50 para R$ 7,00 amanhã, a venda de hoje continua mostrando R$ 5,50.

**Tudo dentro de uma transação.** Criar a venda, criar os itens e baixar o estoque acontecem num `DB::transaction()`. Se qualquer passo falhar, nada fica gravado pela metade. Tem um teste que força um erro na última etapa e confere que não sobrou venda nem item.

**Estoque e concorrência.** Os produtos são lidos com `lockForUpdate()`, em ordem de id, dentro da transação. Se dois caixas tentarem vender a última unidade ao mesmo tempo, o segundo espera o primeiro terminar e recebe "Estoque insuficiente". Na tela de admin, o estoque é **ajustado** (+10, −3) e não sobrescrito. Se o admin abrisse o formulário vendo "10" e salvasse "15", uma venda feita no meio-tempo seria apagada. O estoque também nunca fica negativo.

**Venda finalizada é imutável.** Não existe rota para editar ou excluir venda, e o próprio model lança exceção se algum código tentar dar `update` ou `delete` numa venda ou num item.

**Produto não se exclui, se desativa.** Produtos já vendidos estão ligados às vendas. Desativar tira o produto do caixa sem mexer no histórico.

**Fuso horário.** A aplicação roda em `America/Sao_Paulo`. Em UTC, uma venda às 23h em Brasília cairia no dia seguinte e bagunçaria o fechamento do caixa.

**Busca sem acento.** Cada produto guarda uma versão do nome em minúsculas e sem acentos (`search_name`), mantida automaticamente pelo model. Assim "agua" encontra "Água Mineral" em qualquer banco, inclusive no SQLite, cujo `LIKE` não ignora acentos.

**Fotos dos produtos.** O admin pode enviar um arquivo (JPG, PNG ou WEBP de até 2 MB) ou colar um link `http(s)`. Os uploads vão direto para `public/images/products/uploads`, sem precisar do `storage:link`, que no Windows costuma dar dor de cabeça. Ao trocar ou remover uma foto enviada, o arquivo antigo é apagado.

**Organização do código.** Controllers enxutos, Form Requests para validar a entrada, API Resources para controlar o que sai e um único Service (`SaleService`) onde está a regra da venda. Não criei Repository, DTO nem interface, porque para o tamanho do projeto só seria mais código para ler. No frontend, a lógica fica em hooks (`useCart`, `useProducts`, `useAuth`, `useDailySales`) e os componentes cuidam só da tela.

**Bibliotecas.** Usei só duas além do básico. O **Sanctum** é o pacote oficial do Laravel para autenticação por token. O **lucide-react** fornece os ícones, e importar SVG um a um seria pior. O resto é nativo: `fetch` em vez de axios, `<dialog>` em vez de biblioteca de modal, CSS puro com variáveis em vez de framework de estilo.

## O que eu faria com mais tempo

- Testes no frontend (Vitest) para o carrinho e o cálculo do troco.
- Histórico de movimentações de estoque (quem ajustou, quando e por quê).
- Cadastro de operadores pela tela de admin.
- Quando a venda for recusada por estoque, atualizar o carrinho sozinho e destacar o item com problema.

---

As fotos dos produtos de exemplo vêm do [Unsplash](https://unsplash.com) e do [Pexels](https://www.pexels.com), que permitem uso livre.
