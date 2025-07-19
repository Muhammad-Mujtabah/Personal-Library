/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');
const Book = require('../models/Book');

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({}).select('_id title commentcount');
        res.json(books);
      } catch (err) {
        res.status(500).json({ error: 'Could not retrieve books' });
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.status(400).send('missing required field title');
      }

      try {
        const newBook = new Book({ title, comments: [], commentcount: 0 });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).json({ error: 'Could not create book' });
      }
    })

    .delete(async function(req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).json({ error: 'Could not delete books' });
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send('no book exists');
      }
    })

    .post(async function(req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!comment) {
        return res.status(400).send('missing required field comment');
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }

        book.comments.push(comment);
        book.commentcount = book.comments.length;
        await book.save();

        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send('no book exists');
      }
    })

    .delete(async function(req, res) {
      const bookid = req.params.id;
      try {
        const result = await Book.findByIdAndDelete(bookid);
        if (!result) {
          return res.status(404).send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(500).send('no book exists');
      }
    });
};