// Global variables
let billItems = [];
let totalAmount = 0;
let allBooks = []; // Store all books for filtering
let allCategories = []; // Store all categories

// Load when page is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Billing page loaded");
    loadCustomers();
    loadCategories();
    loadBooks();
    setupEventListeners();
});

// Load customers for dropdown
async function loadCustomers() {
    try {
        console.log("Loading customers...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetCustomersServlet', {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Customers response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Customers server response:', errorText);
            throw new Error('Failed to fetch customers: ' + response.status);
        }
        
        const result = await response.json();
        console.log('Customers result:', result);
        
        if (result.status === "success") {
            populateCustomerDropdown(result.customers);
        } else {
            throw new Error(result.message || 'Failed to load customers');
        }
        
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Failed to load customers: ' + error.message);
    }
}

// Load books for dropdown
async function loadBooks() {
    try {
        console.log("Loading books...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetBooksServlet', {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Books response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Books server response:', errorText);
            throw new Error('Failed to fetch books: ' + response.status);
        }
        
        const result = await response.json();
        console.log('Books result:', result);
        
        if (result.status === "success") {
            allBooks = result.books;
            console.log("Loaded books:", allBooks.length);
        } else {
            throw new Error(result.message || 'Failed to load books');
        }
        
    } catch (error) {
        console.error('Error loading books:', error);
        alert('Failed to load books: ' + error.message);
    }
}

// Load categories for dropdown
async function loadCategories() {
    try {
        console.log("Loading categories...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetCategoriesServlet', {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Categories response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Categories server response:', errorText);
            throw new Error('Failed to fetch categories: ' + response.status);
        }
        
        const result = await response.json();
        console.log('Categories result:', result);
        
        if (result.status === "success") {
            allCategories = result.categories;
            populateCategoryDropdown(allCategories);
        } else {
            throw new Error(result.message || 'Failed to load categories');
        }
        
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Failed to load categories: ' + error.message);
    }
}

// Populate customer dropdown
function populateCustomerDropdown(customers) {
    const dropdown = document.getElementById('customerSelect');
    dropdown.innerHTML = '<option value="">-- Select Customer --</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.accountNo;
        option.textContent = `${customer.name} (${customer.phone}) - Acc: ${customer.accountNo}`;
        dropdown.appendChild(option);
    });
}

// Populate category dropdown
function populateCategoryDropdown(categories) {
    const dropdown = document.getElementById('categorySelect');
    dropdown.innerHTML = '<option value="">-- Select Category --</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

// When category changes, update book dropdown
function updateBookDropdown() {
    const category = document.getElementById('categorySelect').value;
    const bookDropdown = document.getElementById('itemSelect');
    
    bookDropdown.innerHTML = '<option value="">-- Select Book --</option>';
    
    if (category) {
        const filteredBooks = allBooks.filter(book => book.bookCategory === category);
        
        filteredBooks.forEach(book => {
            // Check if book is in stock
            if (book.availableQuantity > 0) {
                const option = document.createElement('option');
                option.value = book.bookCode;
                option.textContent = `${book.bookTitle} - Rs.${book.price.toFixed(2)} (Stock: ${book.availableQuantity})`;
                option.dataset.price = book.price;
                bookDropdown.appendChild(option);
            }
        });
        
        if (filteredBooks.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No books available in this category";
            bookDropdown.appendChild(option);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Payment method toggle
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const cardSection = document.getElementById('cardSection');
        cardSection.style.display = this.value === 'card' ? 'block' : 'none';
    });
    
    // Category change event
    document.getElementById('categorySelect').addEventListener('change', updateBookDropdown);
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addItemToBill);
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            this.value = value.replace(/(\d{4})/g, '$1-').replace(/-$/, '');
        });
    }
}

// Add item to bill
function addItemToBill() {
    const bookSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('qtyInput');
    
    const bookCode = bookSelect.value;
    const bookText = bookSelect.options[bookSelect.selectedIndex].text;
    const quantity = parseInt(quantityInput.value);
    const unitPrice = parseFloat(bookSelect.options[bookSelect.selectedIndex].dataset.price);
    
    if (!bookCode || quantity < 1) {
        alert('Please select a book and enter quantity');
        return;
    }
    
    // Check if already in bill
    const existingItem = billItems.find(item => item.bookCode === bookCode);
    if (existingItem) {
        if (!confirm('This book is already in the bill. Update quantity?')) return;
        // Update existing item
        totalAmount -= existingItem.totalPrice;
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        totalAmount += existingItem.totalPrice;
    } else {
        // Add new item
        const totalPrice = unitPrice * quantity;
        billItems.push({
            bookCode: bookCode,
            bookName: bookText.split(' - ')[0],
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
        });
        totalAmount += totalPrice;
    }
    
    updateBillDisplay();
    
    // Reset selection
    bookSelect.value = '';
    quantityInput.value = '1';
    document.getElementById('categorySelect').value = '';
}

// Update bill display
function updateBillDisplay() {
    const totalElement = document.getElementById('totalAmount');
    const billOutput = document.getElementById('billOutput');
    
    totalElement.textContent = totalAmount.toFixed(2);
    
    // Create bill preview
    let billText = '=== PAHANA EDU BILL ===\n\n';
    billText += 'Items:\n';
    
    if (billItems.length === 0) {
        billText += 'No items added yet\n';
    } else {
        billItems.forEach((item, index) => {
            billText += `${index + 1}. ${item.bookName} x ${item.quantity} = Rs. ${item.totalPrice.toFixed(2)}\n`;
        });
    }
    
    billText += `\nTOTAL: Rs. ${totalAmount.toFixed(2)}`;
    billOutput.textContent = billText;
}

// Generate final bill
async function addBill() {
    const customerSelect = document.getElementById('customerSelect');
    const paymentMethod = document.getElementById('paymentMethod');
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const cvv = document.getElementById('cvv');
    
    // Validation
    if (!customerSelect.value) {
        alert('Please select a customer');
        return;
    }
    
    if (!paymentMethod.value) {
        alert('Please select payment method');
        return;
    }
    
    if (billItems.length === 0) {
        alert('Please add at least one item to the bill');
        return;
    }
    
    if (paymentMethod.value === 'card') {
        if (!cardName.value || !cardNumber.value || !cvv.value) {
            alert('Please fill all card details');
            return;
        }
        
        // Validate card number (remove dashes)
        const cleanCardNumber = cardNumber.value.replace(/\D/g, '');
        if (cleanCardNumber.length !== 16) {
            alert('Please enter a valid 16-digit card number');
            return;
        }
        
        if (cvv.value.length < 3 || cvv.value.length > 4) {
            alert('Please enter a valid CVV (3-4 digits)');
            return;
        }
    }
    
    try {
        // Show loading state
        const generateBtn = document.querySelector('button[onclick="addBill()"]');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Generating Bill...';
        generateBtn.disabled = true;
        
        // Prepare bill data
        const billData = {
            customerId: customerSelect.value,
            paymentMethod: paymentMethod.value,
            cardName: cardName.value || '',
            cardNumber: cardNumber.value.replace(/\D/g, '') || '', // Remove dashes from card number
            cvv: cvv.value || '',
            items: billItems
        };
        
        console.log('Submitting bill:', billData);
        
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/BillingServlet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                customerId: billData.customerId,
                paymentMethod: billData.paymentMethod,
                cardName: billData.cardName,
                cardNumber: billData.cardNumber,
                cvv: billData.cvv,
                items: JSON.stringify(billData.items)
            }),
            credentials: 'include'
        });
        
        console.log('Bill response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Bill server response:', errorText);
            throw new Error('Failed to generate bill: ' + response.status);
        }
        
        const result = await response.json();
        console.log('Bill result:', result);
        
        if (result.status === 'success') {
            alert(`✅ Bill generated successfully!\nBill ID: ${result.billId}\nTotal: Rs. ${result.totalAmount.toFixed(2)}`);
            resetBill();
        } else {
            throw new Error(result.message || 'Failed to generate bill');
        }
        
    } catch (error) {
        console.error('Error generating bill:', error);
        alert('❌ Failed to generate bill: ' + error.message);
    } finally {
        // Restore button state
        const generateBtn = document.querySelector('button[onclick="addBill()"]');
        if (generateBtn) {
            generateBtn.textContent = 'Generate Bill';
            generateBtn.disabled = false;
        }
    }
}

// Reset bill
function resetBill() {
    billItems = [];
    totalAmount = 0;
    updateBillDisplay();
    document.getElementById('customerSelect').value = '';
    document.getElementById('paymentMethod').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('cvv').value = '';
    document.getElementById('cardSection').style.display = 'none';
    document.getElementById('categorySelect').value = '';
    document.getElementById('itemSelect').innerHTML = '<option value="">-- Select Book --</option>';
}

// Add some CSS for better styling
const style = document.createElement('style');
style.textContent = `
    .billing-container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #003366;
    }
    
    select, input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
        box-sizing: border-box;
        margin-bottom: 10px;
    }
    
    select:focus, input:focus {
        border-color: #003366;
        outline: none;
    }
    
    button {
        width: 100%;
        padding: 12px;
        background: #003366;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        margin: 10px 0;
        transition: background-color 0.3s ease;
    }
    
    button:hover:not(:disabled) {
        background: #ff9900;
    }
    
    button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    .total-price {
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        color: #003366;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    #billOutput {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        font-family: 'Courier New', monospace;
        white-space: pre-wrap;
        margin-top: 20px;
        border: 1px solid #ddd;
        max-height: 300px;
        overflow-y: auto;
    }
    
    #cardSection {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #eee;
    }
    
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .error {
        color: #dc3545;
        font-weight: bold;
    }
    
    .success {
        color: #28a745;
        font-weight: bold;
    }
`;
document.head.appendChild(style);