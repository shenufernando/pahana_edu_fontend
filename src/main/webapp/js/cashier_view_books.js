// Load books when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, loading books for cashier...");
    loadBooks();
});

// Load all books from server
async function loadBooks() {
    try {
        console.log("Loading books from server...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/ViewBooksServlet', {
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
        console.log('result.success:', result.success);
        console.log('result.success type:', typeof result.success);
        console.log('result.books:', result.books);
        
        // Check for result.success (boolean) - but let's be more flexible
        if (result.success === true || result.success === "true") {
            console.log('Success condition met, populating table...');
            populateBooksTable(result.books);
        } else {
            console.log('Success condition failed');
            console.log('Available properties:', Object.keys(result));
            throw new Error(result.message || 'Unknown server error');
        }
        
    } catch (error) {
        console.error('Error loading books:', error);
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>Failed to load books. Please check:</p>
            <ul>
                <li>Is the backend server running?</li>
                <li>Check browser console for details</li>
            </ul>
            <p>Error: ${error.message}</p>
        `;
        errorDiv.style.cssText = `
            background: #ffebee;
            border: 2px solid #f44336;
            border-radius: 5px;
            padding: 15px;
            margin: 20px;
            color: #c62828;
        `;
        
        const tableContainer = document.querySelector('.table-container');
        tableContainer.insertBefore(errorDiv, tableContainer.firstChild);
    }
}

// Populate books table for cashier view
function populateBooksTable(books) {
    const tbody = document.querySelector('.styled-table tbody');
    tbody.innerHTML = ''; // Clear existing rows (remove hardcoded data)
    
    console.log("Populating table with", books.length, "books");
    
    if (books.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                No books available in the inventory.
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    books.forEach(book => {
        const row = document.createElement('tr');
        
        // Create image cell - now handles actual images if available
        const imgCell = document.createElement('td');
        if (book.bookImage && book.bookImage !== null) {
            imgCell.innerHTML = `<img src="${book.bookImage}" style="width:50px;height:70px;object-fit:cover;border:1px solid #ddd;" alt="Book cover">`;
        } else {
            imgCell.innerHTML = '<div style="width:50px;height:70px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;">📚</div>';
        }
        
        // Create other cells
        row.innerHTML = `
            <td>${book.bookCode.toString().padStart(10, '0')}</td>
            <td>${book.bookTitle}</td>
            <td>${book.bookCategory}</td>
            <td>Rs. ${book.price.toFixed(2)}</td>
            <td>${book.availableQuantity}</td>
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
    let visibleCount = 0;
    
    rows.forEach(row => {
        // Skip if it's the "no books" message row
        if (row.cells.length === 1) {
            row.style.display = 'none';
            return;
        }
        
        const category = row.cells[3].textContent.toLowerCase(); // Category is in 4th cell (index 3)
        if (category.includes(searchValue)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Remove any existing "no results" rows
    const existingNoResults = document.querySelector('.no-results-row');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    // Show message if no books match the search
    if (visibleCount === 0 && rows.length > 0 && rows[0].cells.length > 1) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                No books found matching "${searchValue}".
            </td>
        `;
        const tbody = document.querySelector('.styled-table tbody');
        tbody.appendChild(noResultsRow);
    }
}

// Add some CSS for better visual feedback
const style = document.createElement('style');
style.textContent = `
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .error-message {
        background: #ffebee;
        border: 2px solid #f44336;
        border-radius: 5px;
        padding: 15px;
        margin: 20px;
        color: #c62828;
    }
    
    .success-message {
        background: #e8f5e8;
        border: 2px solid #4caf50;
        border-radius: 5px;
        padding: 15px;
        margin: 20px;
        color: #2e7d32;
    }
    
    .styled-table tr[style*="display: none"] {
        display: none !important;
    }
`;
document.head.appendChild(style);