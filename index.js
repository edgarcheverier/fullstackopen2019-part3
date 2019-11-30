require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Phonebook = require('./models/phonebook');

app.use(bodyParser.json());
app.use(cors());

morgan.token('request-body', (request, response) => {
  return JSON.stringify(request.body)
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

app.use(express.static('build'));

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
  Phonebook.find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => {
      console.log('/api/persons/:id error: ', error)
      response.status(404).end();
    });
});

app.get('/api/persons/:id', (request, response) => {
  Phonebook.findById(request.params.id)
    .then(result => {
      response.json(result);
    })
    .catch(error => {
      console.log('/api/persons/:id error: ', error)
      response.status(404).end();
    });
});

app.get('/info', (request, response) => {
  const receivedTime = new Date().toString();
  Phonebook.find({})
    .then(result => {
      response.send(
        `
         <h1>Phonebook has info for ${result.length}</h1>
         <h4>${receivedTime}</h4>
        `
      )
    })
    .catch(error => {
      console.log('/api/persons/:id error: ', error)
      response.status(404).end();
    });
});

app.post('/api/persons', (request, response) => {
  if (request.body && request.body.name && request.body.number) {
    Phonebook.findOne({name: request.body.name, number: request.body.number})
      .then(result => {
        if (result) return response.status(400).json({message: 'user already exists'});

        const person = new Phonebook({
          name: request.body.name,
          number: request.body.number
        });

        person.save()
          .then(saveResult => {
            response.json(saveResult)
          })
          .catch(() => response.status(500).json({message: 'error saving user in the DB'}));
      })
      .catch(() => response.status(500).json({message: 'error finding with the DB'}));
  } else {
    response.status(400).json({message: 'name or number missing'});
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
