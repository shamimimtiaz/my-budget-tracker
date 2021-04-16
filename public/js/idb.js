
// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
// save a reference to the database 
const db = event.target.result;

// create an object store (table) called `pending`, set it to have an auto incrementing primary key of sorts
db.createObjectStore('pending', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
// when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
db = event.target.result;
// check if app is online, if yes run checkDatabase() function to send all local db data to api  
if (navigator.online) {
    checkDatabase();
    }
};
request.onerror = function (event) {
    console.log(event.target.errorCode)
};

// This function will be executed if we attempt to submit a new data and there's no internet connection
function saveRecord(record) {
// open a new transaction with the database with read and write permissions 
const transaction = db.transaction(['pending'], 'readwrite');
// access the object store for `pending`
const store = transaction.objectStore('pending');
// add record to your store with add method.
store.add(record);
}
function checkDatabase() {
// open a transaction on your pending db
    const transaction = db.transaction(['pending'], 'readwrite');
// access your pending object store
    const store = transaction.objectStore('pending');
// get all records from store and set to a variable
    const getAll = store.getAll();

getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(serverResponse => {
      if (serverResponse.message) {
        throw new Error(serverResponse);
      }
// delete records if successful
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    store.clear();
    })
        .catch(err => {
// set reference to redirect back here
            console.log(err);
            });
        }
    };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);