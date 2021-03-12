const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const {username} = request.headers;

  const user = users.find((user) => user.username == username);

  if(user == null){
    return response.status(404).json({error: 'Usuário não localizado!'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const user = users.find((user) => user.username == username);

  if(user != null){
    return response.status(406).json({error: 'Usuário já existe'});
  }

  const id = uuidv4();

  const newUser = {
    id,
    name,
    username,
    todos: []
  }

  users.push(newUser);



  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title,deadline} = request.body;
  const {user} = request;

  const id = uuidv4();
  const todo = {
    id: id,
    title: title,
    done: false,
    deadline: new Date(deadline),
    create_ad: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id == id);

  if(todo == null){
    return response.status(404).json({error: "Todo não encontrado!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).send();


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id == id);
  todo.done = true;

  return response.status(200).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id == id);

  user.todos.splice(todo,1);

  return response.status(200).send();

});

module.exports = app;