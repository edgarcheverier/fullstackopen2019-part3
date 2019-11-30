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
      if (result) return response.json(result);
      response.status(404).end();
    })
    .catch(error => {
      console.log('get person by id error: ', error)
      response.status(400).json({message: 'malformatted id'});
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
  if (request.params.id) {
    Phonebook.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end();
      })
      .catch(error => {
        console.log('delete person by id error: ', error)
        response.status(404).end();
      })
  } else {
    response.status(400).json({message: 'id missing'})
  }
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
