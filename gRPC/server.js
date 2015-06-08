var grpc = require('grpc');
var _ = require('underscore');

var booksProto = grpc.load('books.proto');

var BooksServer = grpc.buildServer([booksProto.books.BookService.service]);

// In-memory array of book objects
var books = [
  { id: 123, title: 'The Fountain Head', author: 'Ayn Rand' }
];
var bookStream;

var server = new BooksServer({
  'books.BookService': {
    list: function(call, callback) {
      callback(null, books);
    },
    insert: function(call, callback) {
      books.push(call.request);
      if (bookStream) {
        bookStream.write(call.request);
      }
      callback(null);
    },
    get: function(call, callback) {
      for (var i = 0; i < books.length; i++)
        if (books[i].id == call.request.id)
          return callback(null, books[i]);
      callback({ code: grpc.status.NOT_FOUND, details: 'Not found' });

    },
    delete: function(call, callback) {
      for (var i = 0; i < books.length; i++) {
        if (books[i].id == call.request.id) {
          books.splice(i, 1);
          return callback(null, {});
        }
      }
      callback({ code: grpc.status.NOT_FOUND, details: 'Not found' });
    },
    watch: function(stream) {
      bookStream = stream;
    }
  }
});

server.bind('127.0.0.1:50051');
server.listen();
