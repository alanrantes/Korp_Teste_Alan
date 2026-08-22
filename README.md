# Korp - Gestão Integrada
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-663399?style=flat&logo=css&logoColor=white)
![C%23](https://img.shields.io/badge/C%23-239120?style=flat&logo=csharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=flat&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?style=flat&logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/Entity_Framework_Core-512BD4?style=flat&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)

Aplicação Full Stack para gerenciamento de **estoque e faturamento**, desenvolvida com Angular e ASP.NET Core utilizando uma arquitetura baseada em microsserviços.

O sistema permite cadastrar e gerenciar produtos, criar notas fiscais e realizar automaticamente a baixa do estoque durante o fechamento de uma nota.

## Tecnologias

**Frontend**
- Angular 21
- TypeScript
- HTML / CSS

**Backend**
- C#
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core

**Banco de Dados**
- SQL Server LocalDB

## Estrutura

O projeto é dividido em:

```text
backend/
├── Estoque.Api/        # Produtos e controle de estoque
└── Faturamento.Api/    # Notas fiscais

frontend/               # Aplicação Angular
```

Cada microsserviço possui seu próprio banco de dados.

## Como executar

### Pré-requisitos

Tenha instalado:

- .NET 10 SDK
- Node.js / npm
- SQL Server LocalDB
- Entity Framework CLI (`dotnet-ef`)

Clone o projeto:

```bash
git clone https://github.com/alanrantes/Korp_Teste_Alan.git
cd Korp_Teste_Alan
```

### 1. Preparar os bancos

Estoque:

```bash
cd backend/Estoque.Api
dotnet ef database update
cd ../..
```

Faturamento:

```bash
cd backend/Faturamento.Api
dotnet ef database update
cd ../..
```

As migrations já estão incluídas no projeto.

### 2. Executar Estoque.Api

Em um terminal:

```bash
cd backend/Estoque.Api
dotnet run --launch-profile https
```

API:

```text
https://localhost:xxxx
```

### 3. Executar Faturamento.Api

Em outro terminal:

```bash
cd backend/Faturamento.Api
dotnet run --launch-profile https
```

API:

```text
https://localhost:7202
```

### 4. Executar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

Acesse:

```text
http://localhost:4200
```

> Para o funcionamento completo da aplicação, mantenha as duas APIs e o frontend executando simultaneamente.

## Como testar

### Produtos

Na página **Produtos** é possível:

- cadastrar produtos;
- editar e excluir;
- pesquisar por código ou descrição;
- acompanhar o saldo em estoque.

### Notas Fiscais

Na página **Notas Fiscais**:

1. Selecione um produto e uma quantidade.
2. Adicione o item ao rascunho.
3. Crie a nota fiscal.
4. A nota será criada com status **Aberta**.
5. Clique em **Imprimir Nota** para processá-la.
6. A nota será fechada e o saldo dos produtos será atualizado automaticamente.

## Integração

O fluxo principal da aplicação é:

```text
Angular
   │
   ├── Estoque.Api ────── Produtos / Estoque
   │
   └── Faturamento.Api ── Notas Fiscais
              │
              └──────────► Estoque.Api
                            Baixa de estoque
```

O microsserviço de **Faturamento** se comunica com o de **Estoque** para validar produtos e realizar a baixa das quantidades ao fechar uma nota fiscal.

---

**Desenvolvido por Alan Lacerda Arantes**
