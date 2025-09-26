# Gascontrol - FrontEnd

SPA (Single Page Application) construída com o intuito de se comunicar com o backend criado para este challenge.


## Funcionalidades
- Tela de login com salvamento de um token no localStorage;
- Dashboard interativo com informações à respeito das leituras;
- Gráfico com a medição dos gasômetros;
- Dois CRUDs (gasômetros/leituras) para visualização, criação, edição ou remoção de itens;
- Filtro em todas as páginas;
- Botão de logout para remover o token do localStorage e voltar à tela de login;
- Proteção de todas as rotas ("/dashboard", "/gasometers", "/readings");
- Paginação dividida em 9 itens por tela.


## Tecnologias Utilizadas
- React + Vite;
- Tailwind;
- React Hook Form (validação de formulários);
- Lucide React (ícones estilosos e sugestivos).


## Imagens

### Tela de login
![Login Page](/src/assets/captura_1.png)

### Tela de login (mensagens de erro)
![Login Page Errors](/src/assets/captura_2.png)

### Dashboard
![Dashboard](/src/assets/captura_3.png)

### Gasometers CRUD
![Gasometers](/src/assets/captura_4.png)

### Gasometers Modal
![Gasometers Modal](/src/assets/captura_5.png)

### Readings CRUD
![Readings](/src/assets/captura_6.png)


## Execução (Como fiz para rodar o backend)
- Primeiramente clonei o repo "gascontrol" que continha o backend;
- [repo](https://github.com/resorgatto/gascontrol?tab=readme-ov-file)

- Logo depois acessei a pasta "gascontrol" com "cd gascontrol" e logo depois executei o comando "$ cp env.example.txt .env" para criar uma env e salvar os dados que fariam a conexão;

- Em seguida, executei "docker-compose up --build" e e já estava com o backend sendo executado na porta ":8000";

- Na sequência, criei um superadmin com o comando "docker-compose exec web python manage.py createsuperuser" e então acessei o admin do Django;


## Execução do FrontEnd
- Clonar o [repositório](https://github.com/GuilhermePittner/gascontrol-frontend);

- Acessar "cd gascontrol-frontend";

- Rodar o comando "npm install";

- E para rodar a aplicação, executar "npm run dev";

- Com o backend funcionando, acessar "http://localhost:8000/admin" (ou sua rota local) para conferir seu banco;

- Também é possível popular dados via Postman / Insomnia ou cURL.

- Criar .env dentro de "Gascontrol-frontend" e adicionar sua "VITE_API_BASE_URL="


## Login
- Ao acessar a rota padrão ('/') você poderá fazer o login com as credenciais "admin" e senha "1234 para acessar a aplicação.


## Endpoints utilizados
- GET /api/gasometros/ → lista de gasômetros
- POST /api/gasometros/ → cria gasômetro
- PUT /api/gasometros/{id}/ → edita gasômetro
- DELETE /api/gasometros/{id}/ → remove gasômetro
- GET /api/leituras/ → lista de leituras
- POST /api/leituras/ → cria leitura
- PUT /api/leituras/{id}/ → edita leitura
- DELETE /api/leituras/{id}/ → remove leitura
