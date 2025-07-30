 
    // Helper function to format the date uniformly
    function formatDate(date) {
      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
      return date.toLocaleString("en-US", options);
    }
    
    // Retrieve stored data or initialize empty arrays
    let books = JSON.parse(localStorage.getItem("books")) || [];
    let studentHistory = JSON.parse(localStorage.getItem("studentHistory")) || [];
    let returnHistory = JSON.parse(localStorage.getItem("returnHistory")) || [];
    const adminPassword = "iftmcs123"; // Change as needed
    
    function login() {
      const password = document.getElementById("adminPass").value;
      if (password === adminPassword) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("library").style.display = "block";
        displayBooks();
        displayStudentHistory();
        displayReturnHistory();
      } else {
        alert("Incorrect Password!");
      }
    }
    
    function validateISBN() {
      const isbn = document.getElementById("isbnNumber").value;
      const errorMsg = document.getElementById("isbnError");
      if (isbn.length === 13 && !isNaN(isbn)) {
        errorMsg.style.display = "none";
      } else {
        errorMsg.style.display = "block";
      }
    }
    
    function addBook() {
      const title = document.getElementById("bookTitle").value;
      const author = document.getElementById("bookAuthor").value;
      const isbn = document.getElementById("isbnNumber").value;
      const quantity = document.getElementById("bookQuantity").value;
      if (title && author && isbn.length === 13 && quantity > 0) {
        books.push({ title, author, isbn, quantity: parseInt(quantity) });
        saveBooks();
        displayBooks();
        alert("Book added successfully");
        document.getElementById("bookTitle").value = "";
        document.getElementById("bookAuthor").value = "";
        document.getElementById("isbnNumber").value = "";
        document.getElementById("bookQuantity").value = "";
      } else {
        alert("Please enter valid data! Ensure ISBN is 13 digits and quantity is greater than 0.");
      }
    }
    
    function displayBooks() {
      const bookListElement = document.getElementById("bookList");
      const searchTerm = document.getElementById("inventorySearch").value.trim().toLowerCase();
      bookListElement.innerHTML = "";
      const filteredBooks = books
        .map((book, index) => ({ book, index }))
        .filter(item => {
          if (searchTerm === "") return true;
          return (
            item.book.title.toLowerCase().includes(searchTerm) ||
            item.book.author.toLowerCase().includes(searchTerm) ||
            item.book.isbn.toLowerCase().includes(searchTerm)
          );
        });
      filteredBooks.forEach(item => {
        const book = item.book;
        const origIndex = item.index;
        bookListElement.innerHTML += `
          <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.quantity}</td>
            <td>
              <button onclick="deleteBook(${origIndex})">Delete</button>
            </td>
          </tr>
        `;
      });
    }
    
    function deleteBook(index) {
      books.splice(index, 1);
      saveBooks();
      displayBooks();
    }
    
    function issueBookToStudent() {
      const issueISBN = document.getElementById("issueISBN").value;
      const studentId = document.getElementById("studentIdIssue").value;
      const studentName = document.getElementById("studentNameIssue").value;
      if (!issueISBN || !studentId || !studentName) {
        alert("Please enter Book ISBN, Student ID, and Student Name.");
        return;
      }
      const bookIndex = books.findIndex(b => b.isbn === issueISBN);
      if (bookIndex === -1) {
        alert("Book with given ISBN not found in inventory.");
        return;
      }
      let book = books[bookIndex];
      if (book.quantity <= 0) {
        alert("No copies available to issue.");
        return;
      }
      book.quantity--;
      if (book.quantity === 0) {
        books.splice(bookIndex, 1);
      }
      const issueDate = formatDate(new Date());
      studentHistory.push({
        studentId,
        studentName,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        issueDate
      });
      saveBooks();
      saveStudentHistory();
      displayBooks();
      displayStudentHistory();
      alert("Book issued successfully");
      document.getElementById("issueISBN").value = "";
      document.getElementById("studentIdIssue").value = "";
      document.getElementById("studentNameIssue").value = "";
    }
    
    function returnBook() {
      const returnISBN = document.getElementById("returnISBN").value;
      const studentId = document.getElementById("studentIdReturn").value;
      if (!returnISBN || !studentId) {
        alert("Please enter both Book ISBN and Student ID for return.");
        return;
      }
      const historyIndex = studentHistory.findIndex(
        record => record.isbn === returnISBN && record.studentId === studentId
      );
      if (historyIndex === -1) {
        alert("No matching issue record found for this Student ID and Book ISBN.");
        return;
      }
      const returnedRecord = studentHistory.splice(historyIndex, 1)[0];
      const returnDate = formatDate(new Date());
      returnHistory.push({
        studentId: returnedRecord.studentId,
        title: returnedRecord.title,
        author: returnedRecord.author,
        isbn: returnedRecord.isbn,
        returnDate
      });
      const bookIndex = books.findIndex(b => b.isbn === returnISBN);
      if (bookIndex !== -1) {
        books[bookIndex].quantity++;
      } else {
        books.push({
          title: returnedRecord.title,
          author: returnedRecord.author,
          isbn: returnedRecord.isbn,
          quantity: 1
        });
      }
      saveBooks();
      saveStudentHistory();
      saveReturnHistory();
      displayBooks();
      displayStudentHistory();
      displayReturnHistory();
      alert("Book returned successfully");
      document.getElementById("returnISBN").value = "";
      document.getElementById("studentIdReturn").value = "";
    }
    
    function displayStudentHistory() {
      const historyList = document.getElementById("studentHistoryList");
      const searchTerm = document.getElementById("historySearch").value.trim().toLowerCase();
      historyList.innerHTML = "";
      const filteredHistory = studentHistory.filter(record => {
        if (searchTerm === "") return true;
        return record.studentId.toLowerCase().includes(searchTerm);
      });
      filteredHistory.forEach(record => {
        historyList.innerHTML += `<tr>
          <td>${record.studentId}</td>
          <td>${record.studentName || ""}</td>
          <td>${record.title}</td>
          <td>${record.author}</td>
          <td>${record.isbn}</td>
          <td>${record.issueDate}</td>
        </tr>`;
      });
    }
    
    function displayReturnHistory() {
      const returnHistoryList = document.getElementById("returnHistoryList");
      const searchTerm = document.getElementById("returnHistorySearch").value.trim().toLowerCase();
      returnHistoryList.innerHTML = "";
      const filteredHistory = returnHistory.filter(record => {
        if (searchTerm === "") return true;
        return record.studentId.toLowerCase().includes(searchTerm);
      });
      filteredHistory.forEach(record => {
        returnHistoryList.innerHTML += `<tr>
          <td>${record.studentId}</td>
          <td>${record.title}</td>
          <td>${record.author}</td>
          <td>${record.isbn}</td>
          <td>${record.returnDate}</td>
        </tr>`;
      });
    }
    
    function saveBooks() {
      localStorage.setItem("books", JSON.stringify(books));
    }
    
    function saveStudentHistory() {
      localStorage.setItem("studentHistory", JSON.stringify(studentHistory));
    }
    
    function saveReturnHistory() {
      localStorage.setItem("returnHistory", JSON.stringify(returnHistory));
    }
  