// Load books when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, loading books...");
    loadBooks();
});

// Load all books from server - UPDATED
async function loadBooks() {
    try {
        console.log("Loading books from server...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetAllBooksServlet', {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error('Failed to fetch books: ' + response.status + ' ' + response.statusText);
        }
        
        const result = await response.json();
        console.log('Server returned:', result);
        
        if (result.status === "success") {
            populateBooksTable(result.books);
        } else {
            throw new Error(result.message || 'Unknown server error');
        }
        
    } catch (error) {
        console.error('Error loading books:', error);
        alert('Failed to load books: ' + error.message);
    }
}

// Populate books table
function populateBooksTable(books) {
    const tbody = document.querySelector('.styled-table tbody');
    tbody.innerHTML = ''; // Clear existing rows
    
    console.log("Populating table with", books.length, "books");
    
    books.forEach(book => {
        const row = document.createElement('tr');
        
        // Create image cell
        const imgCell = document.createElement('td');
        if (book.bookImage) {
            // If you have image data, you can create an image element
            imgCell.innerHTML = '<img src="data:image/jpeg;base64,' + book.bookImage + '" width="50" height="70" />';
        } else {
            imgCell.innerHTML = '<span>Image IN DB</span>';
        }
        
        // Create other cells
        row.innerHTML = `
            <td>${book.bookCode.toString().padStart(10, '0')}</td>
            <td>${book.bookTitle}</td>
            <td>${book.bookCategory}</td>
            <td>Rs. ${book.price.toFixed(2)}</td>
            <td>${book.availableQuantity}</td>
            <td>
                <a href="edit_items.html?code=${book.bookCode}" class="edit-link">Edit</a>
                <a href="#" class="btn-delete" onclick="deleteBook(${book.bookCode})">Delete</a>
            </td>
        `;
        
        // Insert image cell at the beginning
        row.insertBefore(imgCell, row.firstChild);
        tbody.appendChild(row);
    });
}

// Filter books by category
function filterBooks() {
    const searchValue = document.getElementById('categorySearch').value.toLowerCase();
    const rows = document.querySelectorAll('.styled-table tbody tr');
    
    rows.forEach(row => {
        const category = row.cells[3].textContent.toLowerCase(); // Category is in 4th cell
        if (category.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Delete book
async function deleteBook(bookCode) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        console.log("Deleting book with code:", bookCode);
        const response = await fetch(`http://localhost:8080/Pahana_edu_backend2/DeleteBookServlet?code=${bookCode}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        console.log('Delete response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete server response:', errorText);
            throw new Error('Failed to delete book: ' + response.status + ' ' + response.statusText);
        }
        
        const result = await response.json();
        console.log('Delete result:', result);
        alert(result.message);
        
        if (result.status === 'success') {
            loadBooks(); // Reload the books list
        }
        
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book: ' + error.message);
    }
}

// Handle form submission
document.getElementById('addBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    console.log("Form data:", Object.fromEntries(formData));
    
    try {
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/AddBookServlet', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        console.log('Add book response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Add book server response:', errorText);
            throw new Error('Failed to add book: ' + response.status + ' ' + response.statusText);
        }
        
        const result = await response.json();
        console.log('Add book result:', result);
        alert(result.message);
        
        if (result.status === 'success') {
            this.reset(); // Clear the form
            loadBooks(); // Reload the books list
        }
        
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book: ' + error.message);
    }
});