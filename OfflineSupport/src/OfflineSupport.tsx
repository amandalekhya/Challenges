import React, { useState, useEffect } from "react";

export const OfflineSupport = () => {
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [books, setBooks] = useState<any>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(true);

  const init = () => {
    let openDB = indexedDB.open("Offline", 1);
    openDB.onupgradeneeded = function () {
      let db = openDB.result;
      if (db.version === 0) {
        openDB = indexedDB.open("Offline", 1);
        db = openDB.result;
      }
      if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id", autoIncrement: true }); // create it
      }
    };
    return openDB;
  };

  const getStoreIndexedDB = (openDB: any) => {
    let db = openDB.result;
    let tx = db.transaction("books", "readwrite");
    let bookStore = tx.objectStore("books");
    if (bookStore) {
      const bookList = bookStore.getAll();
      tx.oncomplete = () => {
        setBooks(bookList.result);
      };
    }
  };

  const loadIndexedDB = () => {
    const openDB = init();
    openDB.onsuccess = () => {
      getStoreIndexedDB(openDB);
    };
  };

  useEffect(() => {
    if (id === null) {
      loadIndexedDB();
      setId(0);
    }
  }, [id, loadIndexedDB]);

  const addBook = () => {
    const openDB = init();
    openDB.onsuccess = () => {
      let transaction = openDB.result.transaction("books", "readwrite");
      let books = transaction.objectStore("books");
      let book = {
        name,
        price,
        created: new Date(),
      };
      let bookList: any;
      const request = books.add(book);
      request.onsuccess = function () {
        console.log("Book added to the store", request);
        bookList = books.getAll();
      };
      request.onerror = function () {
        console.log("Error", request.error);
      };
      transaction.oncomplete = () => {
        console.log("transaction completed added the book into books");
        setBooks(bookList.result);
        setPrice("");
        setName("");
        setShowTable(true);
        setShowForm(false);
      };
    };
  };

  const clearBooks = () => {
    const db = init();
    db.onsuccess = () => {
      const transaction = db.result.transaction("books", "readwrite");
      const books = transaction.objectStore("books");
      const request = books.clear();
      let bookList: any;
      request.onsuccess = function () {
        console.log("Book added to the store", request);
        bookList = books.getAll();
      };
      request.onerror = function () {
        console.log("Error", request.error);
      };
      transaction.oncomplete = () => {
        console.log("transaction completed added the book into books");
        setBooks(bookList.result);
      };
    };
  };

  const removeBook = (id: string) => {
    const db = init();
    db.onsuccess = () => {
      const transaction = db.result.transaction("books", "readwrite");
      const books = transaction.objectStore("books");
      const request = books.delete(id);
      let bookList: any;
      request.onsuccess = function () {
        console.log("Book added to the store", request);
        bookList = books.getAll();
      };
      request.onerror = function () {
        console.log("Error", request.error);
      };
      transaction.oncomplete = () => {
        console.log("transaction compleated deleted the book");
        setBooks(bookList.result);
      };
    };
  };

  return (
    <>
      <div className="container mt-5 ">
        {showForm && (
          <div className="form pb-5 mb-5">
            <div className="form-group">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Itemname"
                aria-label="Itemname"
                aria-describedby="basic-addon1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Price"
                aria-label="Price"
                aria-describedby="basic-addon1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-success float-right ml-2"
              onClick={addBook}
              disabled={name.length === 0 || price.length === 0}
            >
              submit
            </button>
          </div>
        )}
        {showTable && (
          <>
            <button
              type="button"
              className="btn btn-primary float-right mb-2"
              onClick={() => {
                setShowForm(true);
                setShowTable(false);
              }}
            >
              Add
            </button>
            <button
              type="button"
              className="btn btn-danger float-right mr-2"
              onClick={clearBooks}
            >
              Clear Books
            </button>
            <table className="table table-striped ">
              <thead>
                <tr>
                  <th scope="col">id</th>
                  <th scope="col">Name</th>
                  <th scope="col">price</th>
                  <th scope="col">Date</th>
                  <th scope="col">Remove</th>
                </tr>
              </thead>
              <tbody>
                {books &&
                  books.length > 0 &&
                  books.map((book: any, idx: number) => {
                    return (
                      <tr key={idx}>
                        <td>{book.id}</td>
                        <td>{book.name}</td>
                        <td>{book.price}</td>
                        <td>{book.created.toString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeBook(book.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {books && books.length === 0 && (
              <p className="text-center">No records found</p>
            )}
          </>
        )}
      </div>
    </>
  );
};
