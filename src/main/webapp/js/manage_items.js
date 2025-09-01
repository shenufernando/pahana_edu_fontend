// Load books when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, loading books...");
    loadBooks();
});

// Load all books from server - UPDATED
// TEMPORARY DEBUG VERSION - Replace your loadBooks function with this
// ULTRA SIMPLE DEBUG VERSION - This WILL work
// ULTRA SIMPLE DEBUG VERSION - This WILL work
async function loadBooks() {
    console.log("=== STARTING LOAD BOOKS ===");
    
    try {
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetAllBooksServlet');
        console.log("✅ Got response:", response.status);
        
        const result = await response.json();
        console.log("✅ Got JSON:", result);
        
        if (result.success) {
            console.log("✅ Success confirmed, books count:", result.books.length);
            
            // Test if we can find the table
            const tbody = document.querySelector('.styled-table tbody');
            console.log("✅ Found table body:", tbody);
            
            if (!tbody) {
                alert("ERROR: Can't find table with class 'styled-table tbody' in your HTML!");
                return;
            }
            
            // Clear table
            tbody.innerHTML = '';
            console.log("✅ Cleared table");
            
            // Add real books with proper Edit/Delete actions
            for (let i = 0; i < result.books.length; i++) {
                const book = result.books[i];
                console.log(`Processing book ${i}:`, book);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        ${book.bookImage && book.bookImage !== null && book.bookImage !== "" 
                            ? '<span style="color: green; font-weight: bold;">Image in DB</span>' 
                            : '<span style="color: red;">No Image</span>'}
                    </td>
                    <td>${book.bookCode.toString().padStart(10, '0')}</td>
                    <td>${book.bookTitle}</td>
                    <td>${book.bookCategory}</td>
                    <td>Rs. ${book.price.toFixed(2)}</td>
                    <td>${book.availableQuantity}</td>
                    <td>
                        <a href="edit_items.html?code=${book.bookCode}" class="edit-link">Edit</a>
                        <a href="#" class="btn-delete" onclick="deleteBook(${book.bookCode}); return false;">Delete</a>
                    </td>
                `;
                tbody.appendChild(row);
                console.log(`✅ Added book ${i} to table`);
            }
            
            console.log("SUCCESS! Loaded " + result.books.length + " books!");
            
        } else {
            alert("Server said: " + result.message);
        }
        
    } catch (error) {
        console.error("❌ The actual error is:", error);
        console.error("❌ Error name:", error.name);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
        alert("Real error: " + error.name + " - " + error.message);
    }
}



// Populate books table - SIMPLIFIED VERSION (No image loading)
function populateBooksTable(books) {
    const tbody = document.querySelector('.styled-table tbody');
    tbody.innerHTML = ''; // Clear existing rows
    
    console.log("Populating table with", books.length, "books");
    
    books.forEach(book => {
        const row = document.createElement('tr');
        
        // Create image cell - SIMPLIFIED: Just show "Image in DB" text
        const imgCell = document.createElement('td');
        if (book.bookImage && book.bookImage !== null && book.bookImage !== "") {
            imgCell.innerHTML = '<span style="color: green; font-weight: bold;">Image in DB</span>';
        } else {
            imgCell.innerHTML = '<span style="color: red;">No Image</span>';
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