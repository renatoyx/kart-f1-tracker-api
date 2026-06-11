# Kart F1 Tracker API

Uma API para organizar e explorar o histórico de kart dos pilotos que chegaram
à Fórmula 1.

A ideia nasceu de uma curiosidade simples: antes dos carros de Fórmula 1, quais
campeonatos esses pilotos disputaram, por quais equipes passaram e quais deles
já se enfrentavam no kart?

O projeto reúne uma API em Node.js, um banco SQLite e um scraper em Python. Com
isso, é possível cadastrar pilotos, registrar temporadas de kart e cruzar o
histórico de dois competidores para encontrar rivalidades anteriores à F1.

> Este é um projeto em evolução. A base técnica e os primeiros fluxos estão
> funcionais, mas ainda há espaço para testes mais amplos, migrations, novos
> dados e análises mais profundas.

## O que já funciona

- Cadastro e consulta de pilotos.
- Cadastro e consulta de históricos de kart.
- Consulta dos registros de kart de um piloto específico.
- Comparação entre dois pilotos para descobrir campeonatos compartilhados.
- Documentação interativa com Swagger.
- Inicialização automática das tabelas do SQLite.
- Scraper com Selenium para importar a tabela de carreira no kart da Wikipedia.
- Limpeza de referências, espaços e quebras de linha encontradas no HTML.
- Proteção contra duplicação durante novas execuções do scraper.

## Tecnologias

### Backend

- Node.js 22+
- TypeScript
- Fastify
- SQLite
- `sqlite` para acesso assíncrono ao banco
- Swagger/OpenAPI
- dotenv

### Scraper

- Python 3.12+
- Selenium
- Selenium Manager
- `sqlite3` nativo do Python
- Expressões regulares para limpeza dos dados

## Como o projeto está organizado

```text
kart-f1-tracker-api/
├── scraper/
│   ├── cleaner.py
│   ├── main.py
│   ├── requirements.txt
│   └── test_cleaner.py
├── src/
│   ├── dao/
│   │   ├── DriverDAO.ts
│   │   └── KartingRecordDAO.ts
│   ├── database/
│   │   └── db.ts
│   ├── models/
│   │   ├── Driver.ts
│   │   └── KartingRecord.ts
│   ├── routes/
│   │   ├── analyticsRoutes.ts
│   │   ├── driverRoutes.ts
│   │   ├── healthRoutes.ts
│   │   └── kartingRecordRoutes.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

O `server.ts` cuida do bootstrap da aplicação, do Swagger e do registro das
rotas. As consultas ficam isoladas nos DAOs, enquanto os modelos representam
os dados que entram e saem da aplicação.

O banco é criado em:

```text
data/kart-f1-tracker.db
```

Esse diretório está no `.gitignore`. Dados locais, ambientes virtuais,
dependências e arquivos `.env` não são enviados ao repositório.

## Primeiros passos

### Requisitos

Antes de começar, tenha instalado:

- Node.js 22 ou superior
- npm
- Python 3.12 ou superior, caso queira usar o scraper
- Google Chrome para a execução atual do scraper

### Instalação do backend

Clone o repositório e instale as dependências:

```powershell
git clone <url-do-repositorio>
cd kart-f1-tracker-api
npm install
```

Crie o arquivo de ambiente a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Configuração padrão:

```dotenv
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
```

### Executando em desenvolvimento

```powershell
npm run dev
```

A API estará disponível em:

```text
http://localhost:3333
```

O banco e suas tabelas são criados automaticamente durante a inicialização.

### Build e execução

```powershell
npm run build
npm start
```

## Documentação Swagger

Com o servidor em execução, acesse:

```text
http://localhost:3333/docs
```

O Swagger permite visualizar os contratos e testar as rotas diretamente pelo
navegador. A interface possui um tema azul e branco próprio do projeto.

O documento OpenAPI em JSON fica disponível em:

```text
http://localhost:3333/docs/json
```

## Rotas da API

### Saúde da aplicação

```http
GET /health
```

Resposta:

```json
{
  "status": "ok",
  "service": "kart-f1-tracker-api"
}
```

### Pilotos

#### Listar pilotos

```http
GET /drivers
```

#### Buscar um piloto

```http
GET /drivers/:id
```

#### Cadastrar um piloto

```http
POST /drivers
Content-Type: application/json
```

```json
{
  "name": "Max Verstappen",
  "nationality": "Dutch",
  "birthDate": "1997-09-30"
}
```

Os campos `name` e `nationality` são obrigatórios. `birthDate` é opcional e
deve usar o formato `YYYY-MM-DD`.

### Históricos de kart

#### Listar todos os registros

```http
GET /karting-records
```

#### Buscar um registro

```http
GET /karting-records/:id
```

#### Listar o histórico de um piloto

```http
GET /drivers/:driverId/karting-records
```

#### Cadastrar um registro

```http
POST /karting-records
Content-Type: application/json
```

```json
{
  "driverId": 1,
  "year": 2013,
  "championship": "CIK-FIA European Championship",
  "category": "KZ",
  "team": "CRG",
  "chassis": "CRG",
  "engine": "TM Racing",
  "result": "Champion"
}
```

São obrigatórios: `driverId`, `year` e `championship`. Os demais campos são
opcionais porque as fontes históricas nem sempre apresentam todos os detalhes.

### Rivalidades

```http
GET /analytics/rivalries?driver1=1&driver2=2
```

Essa rota procura temporadas em que os dois pilotos participaram do mesmo
campeonato, no mesmo ano e na mesma categoria.

A comparação é feita pelo SQLite usando um `INNER JOIN` da tabela
`karting_records` com ela mesma. Isso evita carregar históricos completos na
memória da aplicação apenas para filtrá-los em JavaScript.

Exemplo de resposta:

```json
[
  {
    "year": 2012,
    "championship": "WSK Euro Series",
    "category": "KF2",
    "driver1": {
      "driverId": 1,
      "chassis": "Intrepid",
      "engine": "TM Racing",
      "result": "6th"
    },
    "driver2": {
      "driverId": 2,
      "chassis": "Tony Kart",
      "engine": "Vortex",
      "result": "3rd"
    }
  }
]
```

Os IDs precisam ser diferentes. Se não houver campeonatos em comum, a API
retorna um array vazio.

## Importando dados com o scraper

O scraper acessa a página de um piloto na Wikipedia e procura a seção
`Karting career summary`.

Além de extrair os registros, ele trata alguns problemas comuns desse tipo de
HTML:

- Referências como `[1]` e `[a]`.
- Quebras de linha dentro das células.
- Espaços duplicados e espaços não separáveis.
- Caracteres invisíveis.
- Anos omitidos visualmente por células com `rowspan`.

### Preparando o ambiente Python

Primeiro, inicialize o backend pelo menos uma vez. Isso cria o banco e as
tabelas necessárias:

```powershell
npm run dev
```

Depois, em outro terminal:

```powershell
cd scraper
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

O Selenium Manager encontra e gerencia o WebDriver compatível com o navegador.
Não é necessário baixar o ChromeDriver manualmente.

### Importando Max Verstappen

Max Verstappen é o piloto padrão usado durante o desenvolvimento:

```powershell
python main.py --nationality "Dutch"
```

### Importando outro piloto

Informe o nome, a URL da Wikipedia e a nacionalidade:

```powershell
python main.py "Lewis Hamilton" `
  "https://en.wikipedia.org/wiki/Lewis_Hamilton" `
  --nationality "British"
```

O script procura o piloto pelo nome sem diferenciar letras maiúsculas e
minúsculas. Se não o encontrar, cria um novo cadastro.

Antes de inserir um histórico, também verifica se já existe um registro com o
mesmo piloto, ano, campeonato, equipe e resultado. Por isso, o scraper pode ser
executado novamente sem duplicar os dados já importados.

> A estrutura das páginas da Wikipedia pode mudar. O scraper depende atualmente
> do identificador `Karting_career_summary` e da ordem das colunas da tabela.

## Testes disponíveis

Os testes atuais cobrem as regras de limpeza do scraper:

```powershell
python -m unittest discover -s scraper -p "test_*.py"
```

Para validar o TypeScript:

```powershell
npm run build
```

Ainda não há uma suíte automatizada de testes de integração para a API. Esse é
um dos próximos passos naturais do projeto.

## Modelo de dados

### `drivers`

Armazena os dados básicos do piloto:

- `id`
- `name`
- `nationality`
- `birth_date`
- `created_at`

### `karting_records`

Armazena cada participação histórica:

- `id`
- `driver_id`
- `year`
- `championship`
- `category`
- `team`
- `chassis`
- `engine`
- `result`
- `created_at`

`driver_id` possui chave estrangeira para `drivers`. Ao excluir um piloto
diretamente no banco, seus registros são removidos em cascata.

## Decisões do projeto

### Por que Fastify?

O Fastify oferece uma base enxuta, boa integração com TypeScript e validação
por JSON Schema. Os mesmos schemas também ajudam a produzir a documentação
OpenAPI.

### Por que SQLite?

Para esta fase, o SQLite mantém o projeto simples de instalar e executar. Não é
necessário subir um serviço externo, e o mesmo arquivo pode ser acessado pelo
backend Node.js e pelo scraper Python.

### Por que DAOs?

Os DAOs evitam espalhar SQL pelas rotas. Assim, as rotas cuidam do protocolo
HTTP, enquanto `DriverDAO` e `KartingRecordDAO` concentram persistência e
consultas.

### Por que Selenium?

O scraper começou com Selenium para permitir navegação real e dar espaço a
páginas que dependam do navegador. Para a tabela atual da Wikipedia, uma
abordagem somente HTTP também poderia ser considerada no futuro por ser mais
leve.

## Limitações conhecidas

- O scraper depende da estrutura atual da Wikipedia.
- A API ainda não possui autenticação ou autorização.
- Não há paginação nas listagens.
- Não existem rotas de atualização e exclusão.
- O schema é inicializado por `CREATE TABLE IF NOT EXISTS`, sem migrations.
- Não há testes automatizados dos DAOs e das rotas HTTP.
- Os textos históricos dependem da qualidade e consistência da fonte original.
- O banco local não deve ser tratado como uma fonte oficial ou definitiva.

## Próximos passos

Algumas evoluções que combinam com a proposta:

- Adicionar testes de integração com Fastify `inject`.
- Criar migrations versionadas.
- Incluir paginação e filtros por ano, categoria e campeonato.
- Melhorar a deduplicação dos dados importados.
- Adicionar rotas de atualização e remoção.
- Importar mais pilotos e revisar os dados coletados.
- Criar análises de equipes, chassis, motores e adversários recorrentes.
- Evoluir para as rotas de engenharia e acerto de kart.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API em modo de desenvolvimento |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Executa a versão compilada |

## Licença

Distribuído sob a licença MIT.

## Nota sobre os dados

Este projeto tem finalidade educacional e experimental. Os dados coletados da
Wikipedia devem ser revisados antes de qualquer uso que exija precisão
histórica. A aplicação não possui vínculo oficial com a Fórmula 1, FIA,
Wikipedia, pilotos, equipes ou fabricantes citados.
