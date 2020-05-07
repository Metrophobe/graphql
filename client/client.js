document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#queryAuthors").addEventListener("click", () => {
    //Here we are using the fetch operation to query GraphQL
    //Specify URL
    fetch("http://localhost:5000/gql", {
      //SPecify Method
      method: "POST",
      //Set Header!
      headers: {
        "Content-Type": "application/json",
      },
      //Set request  body - our query ... rings a bell?
      body: JSON.stringify({ query: "{ books { id,name,author{name}} }" }),
    })
      //Then convert the response to json
      .then((res) => res.json())
      .then((res) => {
        const booksList = document.querySelector("#books");
        //and show it....
        res.data.books.forEach((book) => {
          const li = document.createElement("li");
          li.innerText = `${book.id} - ${book.name} - ${book.author.name}`;
          booksList.appendChild(li);
        });
      });
  });

  //More of the same as above....
  document.querySelector("#queryBooks").addEventListener("click", () => {
    fetch("http://localhost:5000/gql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ authors {id,name,books{id}} }" }),
    })
      .then((res) => res.json())
      .then((res) => {
        const authorsList = document.querySelector("#authors");
        console.log(res.data.authors);
        res.data.authors.forEach((author) => {
          const li = document.createElement("li");
          li.innerText = `${author.id} - ${author.name} - books made ${author.books.length}`;
          authorsList.appendChild(li);
        });
      });
  });
});
