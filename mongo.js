const mongoose = require('mongoose');

if (!process.argv[2]) {
  console.log('password parameter missing');
  process.exit(1);
}

const password = process.argv[2];

const URL = `mongodb+srv://edgarcheverier:${password}@cluster0-5kmqs.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(URL, {useNewUrlParser: true});

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Phonebook = mongoose.model('Phonebook', phonebookSchema);

if (process.argv[3] && process.argv[4]) {
  const person = new Phonebook({
    name: process.argv[3],
    number: process.argv[4]
  });

  person.save().then(response => {
    console.log(`added ${response.name} number ${response.number} to phonebook`);

    mongoose.connection.close();
  })
} else {
  Phonebook.find({}).then(results => {
    console.log('phonebook:')
    results.forEach(result => {
      console.log(`${result.name} ${result.number}`)
    });

    mongoose.connection.close();
  })
}
