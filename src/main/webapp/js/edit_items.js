// Get book code from URL parameters
function getBookCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// Load book data when page loads
document.addEventListener('DOMContentLoaded', function() {
    const bookCode = getBookCodeFromURL();
    
    if (bookCode) {
        loadBookData(bookCode);
    } else {
        alert('No book code provided!');
        window.location.href = 'manage_items.html';
    }
});

// Load book data from server
async function loadBookData(bookCode) {
    try {
        const response = await fetch(`http://localhost:8080/Pahana_edu_backend2/GetBookServlet?code=${bookCode}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch book data');
        
        const result = await response.json();
        
        if (result.status === 'success') {
            populateForm(result);
        } else {
            alert('Book not found: ' + result.message);
            window.location.href = 'manage_items.html';
        }
        
    } catch (error) {
        console.error('Error loading book:', error);
        alert('Failed to load book data: ' + error.message);
        window.location.href = 'manage_items.html';
    }
}

// Populate form with book data
function populateForm(bookData) {
    document.getElementById('bookCode').value = bookData.bookCode;
    document.getElementById('bookTitle').value = bookData.bookTitle;
    document.getElementById('bookCategory').value = bookData.bookCategory;
    document.getElementById('price').value = bookData.price;
    document.getElementById('quantity').value = bookData.availableQuantity;
    
    // Display current image using the ImageServlet
    const currentImage = document.getElementById('currentImage');
    currentImage.src = `http://localhost:8080/Pahana_edu_backend2/BookImageServlet?code=${bookData.bookCode}`;
    currentImage.onerror = function() {
        this.src = '../images/default-book.jpg';
    };
}

// Handle form submission
document.getElementById('editBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/UpdateBookServlet', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to update book');
        
        const result = await response.json();
        alert(result.message);
        
        if (result.status === 'success') {
            window.location.href = 'manage_items.html';
        }
        
    } catch (error) {
        console.error('Error updating book:', error);
        alert('Failed to update book: ' + error.message);
    }
});