const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Book = require('./book');
const Joi = require('joi');
require('dotenv').config();
const cors = require('cors');
app.use(cors());

function validateBook(book) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    author: Joi.string().min(3).required()
  });

  return schema.validate(book);
}

mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'))

app.use(express.json());

app.get('/', (req, res) => {
  res.send('World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});

let books = [];

// Create a Book
app.post('/books', async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let book = new Book({ title: req.body.title, author: req.body.author });
    book = await book.save();
    res.send(book);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get All Books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.send(books);
  } catch(err){
    res.status(400).send(err.message);
  }
});

// Get a Single Book
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.send(book);
  } catch (err) {
    res.status(500).send('Something went wrong');
  }
});

// Update a Book
app.put('/books/:id', async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) return res.status(500).send(error.details[0].message);
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { title: req.body.title, author: req.body.author }, { new: true });
    if (!book) return res.status(404).send('Book not found');
    res.send(book);
  } catch (err){
    res.status(500).send('Something went wrong');
  }
});

// Delete a Book
app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.status(204).send();
  } catch (err){
    res.status(500).send('Something went wrong');
  }
});