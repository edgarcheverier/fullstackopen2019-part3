const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

morgan.token('request-body', (request, response) => {
  return JSON.stringify(request.body)
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(ele => ele.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get('/info', (request, response) => {
  const receivedTime = new Date().toString();
  response.send(
    `
     <h1>Phonebook has info for ${persons.length}</h1>
     <h4>${receivedTime}</h4>
    `
  )
});

app.post('/api/persons', (request, response) => {
  if (request.body && request.body.name && request.body.number) {
    const noUniquePerson = persons.some(person => {
      return person.name.toLowerCase() === request.body.name.toLowerCase();
    });
    if (noUniquePerson) {
      return response.status(400).json({message: 'name must be unique'});
    }
    const id = Math.floor(Math.random() * 10000);
    const newPerson = {
      name: request.body.name,
      number: request.body.number,
      id
    };
    persons = persons.concat(newPerson);
    return response.json(newPerson);
  }
  response.status(400).json({message: 'name or number missing'})
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});

const port = 3001
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
