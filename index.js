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
      console.log('Get all persons error DB: ', error)
      response.status(500).end();
    });
});

app.get('/api/persons/:id', (request, response, next) => {
  if (request.params.id) {
    Phonebook.findById(request.params.id)
    .then(result => {
      if (result) return response.json(result);
      response.status(404).end();
    })
    .catch(error => next(error));
  } else {
    response.status(400).json({message: 'id missing'});
  }
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
      console.log('Get total persons error DB:', error)
      response.status(500).end();
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

app.delete('/api/persons/:id', (request, response, next) => {
  if (request.params.id) {
    Phonebook.findByIdAndDelete(request.params.id)
      .then(() => {
        response.status(204).end();
      })
      .catch(error => next(error));
  } else {
    response.status(400).json({message: 'id missing'})
  }
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError' &&  error.kind === 'ObjectId') {
    return response.status(400).json({message: 'malformatted id'});
  }

  next(error)
}

app.use(errorHandler);

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
