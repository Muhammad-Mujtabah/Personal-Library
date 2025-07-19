/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Book = require('../models/Book');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testBookId;

  // Clear database before tests
  suiteSetup(async function() {
    await Book.deleteMany({});
  });

  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should have _id');
            assert.property(res.body, 'title', 'Book should have title');
            assert.equal(res.body.title, 'Test Book');
            testBookId = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function() {
      test('Test GET /api/books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], '_id', 'Books should have _id');
            assert.property(res.body[0], 'title', 'Books should have title');
            assert.property(res.body[0], 'commentcount', 'Books should have commentcount');
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function() {
      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/507f1f77bcf86cd799439011')
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .get(`/api/books/${testBookId}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should have _id');
            assert.property(res.body, 'title', 'Book should have title');
            assert.property(res.body, 'comments', 'Book should have comments');
            assert.equal(res.body.title, 'Test Book');
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post(`/api/books/${testBookId}`)
          .send({ comment: 'This is a test comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should have _id');
            assert.property(res.body, 'title', 'Book should have title');
            assert.property(res.body, 'comments', 'Book should have comments');
            assert.isArray(res.body.comments, 'comments should be an array');
            assert.include(res.body.comments, 'This is a test comment');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai.request(server)
          .post(`/api/books/${testBookId}`)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        chai.request(server)
          .post('/api/books/507f1f77bcf86cd799439011')
          .send({ comment: 'This should not work' })
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .delete(`/api/books/${testBookId}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .delete('/api/books/507f1f77bcf86cd799439011')
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });
  });
});