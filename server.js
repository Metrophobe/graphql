//===============================================================================================================================================
//Dummy Data
//===============================================================================================================================================
const authors = [
  {
    id: 1,
    name: "J K Rowlling",
  },
  {
    id: 2,
    name: "J K Tolkien",
  },
  {
    id: 3,
    name: "Brent Weeks",
  },
];

const books = [
  {
    id: 1,
    name: "Harry Potter 1",
    authorid: 1,
  },
  {
    id: 2,
    name: "Harry Potter 2",
    authorid: 1,
  },
  {
    id: 3,
    name: "Harry Potter 3",
    authorid: 1,
  },
  {
    id: 4,
    name: "Harry Potter 4",
    authorid: 1,
  },
  {
    id: 5,
    name: "Fellowship of the Ring",
    authorid: 2,
  },
  {
    id: 6,
    name: "Return of the Ring",
    authorid: 2,
  },
  {
    id: 7,
    name: "The Shadows",
    authorid: 3,
  },
  {
    id: 8,
    name: "Beyond the Ring",
    authorid: 3,
  },
];
//===============================================================================================================================================
//Graph QL , imports
//===============================================================================================================================================

//You import all types that you need for your queries and mutations through the graphql library
const {
  GraphQLSchema, //Used to represent the schema of your data
  GraphQLObjectType, //As the name implies this is a GraphQL object used to create Types (can think of these as your entities)
  GraphQLString, //represents strings in GQL
  GraphQLInt, //represents int in GQL
  GraphQLNonNull, //Used to indicate non null fields
  GraphQLList, //Used to represent a collection
} = require("graphql");

//===============================================================================================================================================
// Types (Entities)
//===============================================================================================================================================

//Based on our data we need two entites books and authors
//...lets take a look how we create them and how we create relationshuips between them
const BookType = new GraphQLObjectType({
  name: "Book", //name
  description: "represents a book", //description of type
  fields: () => ({
    // fields ... you need to define the types think of these as table definitions ...
    id: {
      type: GraphQLNonNull(GraphQLInt), //the id is a non null int
    },
    name: {
      type: GraphQLNonNull(GraphQLString), //the name is a non null string
    },
    authorid: {
      type: GraphQLNonNull(GraphQLInt), // the authorid is the non null int
    },
    author: {
      type: GraphQLNonNull(AuthorType), //this is also not null and as you can see it refers to the AuthorType .... this is creating a many to one relationship between the two types ....
      resolve: (book) => {
        //resolve is implicitly invoked by GraphQL when a query that involves the author (through book) is made ... this will allow it to return the data as per logic inside it
        return authors.find((author) => book.authorid === author.id); //resolve takes two parameters ....the parent (in this case book = the current object ) and args (used for inputs)
        //searching the authors collection => lookup the author of this book through the authorid
        //We use find because it is a many to one relationship
      },
    },
  }),
});

//Author type - very similar to above
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "represents the author of a  book",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        //same exact everything only that here we need to get all the books written by this author
        return books.filter((book) => book.authorid === author.id); //Here we use filter and not find since one author may have many books ... one-to-many relationship
      },
    },
  }),
});

//===============================================================================================================================================
//  (Mutations)
//
//  mutators used for manipulation of the data aka (C)reation, (U)pdating , (D)eletion
//===============================================================================================================================================

//Root Mutation Type establishes the mutation operations that will be possible on the api here I provide an add book and add author options
const RootMutationType = new GraphQLObjectType({
  //Again the Object ype takes the name , description and fields , similarly to above the fields here are the mutators
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addAuthor: {
      //Add Author mutation
      type: AuthorType, //specify the type to be used
      description: "Adding an Author", // a description
      args: {
        //args for input in this case we need a name and it cannot be null
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        //In this case resolve makes use of the second parameter aka args
        const author = { id: authors.length + 1, name: args.name }; //From this we use it to get the name
        authors.push(author); //Then once author is created, we save it in the collection
        return author; //then return the author
      },
    },

    //Similar to above here we are adding a book
    addBook: {
      type: BookType,
      description: "Add Book",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        author: {
          type: GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          author: args.author,
        };
        books.push(book);
        return book;
      },
    },
  }),
});

//===============================================================================================================================================
//  (Queries)
//
//  Queries are used for definining the allowable (R)equests that on the data
//===============================================================================================================================================

//Root Query Type specifies all the operations that can be used to query our data
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    books: {
      //SELECT * FROM BOOKS
      type: GraphQLList(BookType),
      description: "List of Books",
      resolve: () => books,
    },
    book: {
      //SELECT * FROM BOOKS WHERE ID=@BookId
      type: BookType,
      description: "Gets 1 book by id",
      args: {
        id: {
          type: GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    authors: {
      //SELECT * FROM AUTHORS
      type: GraphQLList(AuthorType),
      description: "List of Authors",
      resolve: () => authors,
    },
    author: {
      //SELECT * FROM AUTHORS WHERE ID=@AuthorId OR name=@Authorname
      type: AuthorType,
      description: "Returns one author by name or id",
      args: {
        id: {
          type: GraphQLInt,
        },
        name: {
          type: GraphQLString,
        },
      },
      resolve: (parent, args) =>
        authors.find(
          (author) => author.id === args.id || author.name === args.name
        ),
    },
  }),
});

//===============================================================================================================================================
//  (Schema)
//
//===============================================================================================================================================

//Defines the scema and speciefies the rules, in this case we specify the queries and mutators
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

//============================================= Creating server =================================================

//We first require express
const express = require("express");

//Then we get the express graphql middleware
const expressGraphQL = require("express-graphql");

//Just in case you are interested in cors ....
//const cors = require("cors");

//path
const path = require("path");

//Then we create a server
const app = express();

//Test Client
app.use(express.static(path.join(__dirname, "client")));

//Use the expressGraphQL Middleware aka GraphiQL
app.use(
  "/gql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

//Utilising CORS
//app.use(cors());//basic allow origin *

//Route
app.get("/", function (req, res) {
  // save html files in the `views` folder...
  res.sendfile("index.html");
});

//Start off the server .... with npm start
app.listen(5000, () => console.log("server running at port 5000"));

//Go to localhost:5000/gql

//usage syntax
//{ } = query so for example '{ books { id, name }}' returns the books' ids and names
//mutation{} = mutation so for exxample 'mutation{addBook(name:"test Book",author:1){id}}' creates a book and returns its newly created id
//Enjoy!
