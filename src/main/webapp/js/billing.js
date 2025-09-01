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

// Load customers for dropdown - FIXED VERSION
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
        
        // Show error message in the dropdown itself
        const dropdown = document.getElementById('customerSelect');
        dropdown.innerHTML = `
            <option value="">-- Error loading customers --</option>
            <option value="">Please check console for details</option>
        `;
        
        alert('Failed to load customers. Please check browser console for details.');
    }
}

// Populate customer dropdown - FIXED VERSION
function populateCustomerDropdown(customers) {
    const dropdown = document.getElementById('customerSelect');
    
    if (!dropdown) {
        console.error('Customer select dropdown not found!');
        return;
    }
    
    dropdown.innerHTML = '<option value="">-- Select Customer --</option>';
    
    if (!customers || customers.length === 0) {
        dropdown.innerHTML += '<option value="">No customers found</option>';
        return;
    }
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.accountNo || customer.customerId;
        option.textContent = `${customer.name || 'Unknown'} (${customer.phone || 'No phone'}) - Acc: ${customer.accountNo || customer.customerId}`;
        dropdown.appendChild(option);
    });
    
    console.log(`Populated ${customers.length} customers`);
}

// Load books for dropdown
async function loadBooks() {
    try {
        console.log("Loading books...");
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/BookTitlesServlet', {
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

// Populate category dropdown
function populateCategoryDropdown(categories) {
    const dropdown = document.getElementById('categorySelect');
    
    if (!dropdown) {
        console.error('Category select dropdown not found!');
        return;
    }
    
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
    
    if (!bookDropdown) {
        console.error('Item select dropdown not found!');
        return;
    }
    
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
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            const cardSection = document.getElementById('cardSection');
            if (cardSection) {
                cardSection.style.display = this.value === 'card' ? 'block' : 'none';
            }
        });
    }
    
    // Category change event
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateBookDropdown);
    }
    
    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addItemToBill);
    }
    
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
    
    if (!bookSelect || !quantityInput) {
        alert('Form elements not found!');
        return;
    }
    
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
    
    if (!totalElement || !billOutput) {
        console.error('Bill display elements not found!');
        return;
    }
    
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
    
    if (!customerSelect) {
        alert('Customer selection not found!');
        return;
    }
    
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
        if (generateBtn) {
            const originalText = generateBtn.textContent;
            generateBtn.textContent = 'Generating Bill...';
            generateBtn.disabled = true;
        }
        
        // Prepare bill data
        const billData = {
            customerId: customerSelect.value,
            paymentMethod: paymentMethod.value,
            cardName: cardName ? cardName.value || '' : '',
            cardNumber: cardNumber ? cardNumber.value.replace(/\D/g, '') || '' : '',
            cvv: cvv ? cvv.value || '' : '',
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
            const successMessage = `✅ Bill generated successfully!\nBill ID: ${result.billId}\nTotal: Rs. ${result.totalAmount.toFixed(2)}`;
            
            // Ask user if they want to download the bill
            if (confirm(successMessage + '\n\nWould you like to download the bill as PDF?')) {
                downloadBill(result.billId);
            }
            
            // Reset bill after successful submission
            setTimeout(() => {
                resetBill();
            }, 1000);
            
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

// Download bill as PDF
async function downloadBill(billId = null) {
    try {
        // If we have a bill ID, fetch the bill details
        let billData = null;
        
        if (billId) {
            // Fetch bill details from server
            const response = await fetch(`http://localhost:8080/Pahana_edu_backend2/GetBillServlet?billId=${billId}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                billData = await response.json();
            }
        }
        
        // If we don't have bill data from server, use local data
        if (!billData) {
            const customerSelect = document.getElementById('customerSelect');
            const customerText = customerSelect.options[customerSelect.selectedIndex].text;
            
            billData = {
                billId: billId || 'TEMP-' + Date.now(),
                customer: customerText,
                items: billItems,
                totalAmount: totalAmount,
                date: new Date().toLocaleDateString()
            };
        }
        
        // Create a printable bill content
        const billContent = `
            <html>
                <head>
                    <title>Bill ${billData.billId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .bill-details { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total { font-weight: bold; text-align: right; margin-top: 20px; }
                        .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>PAHANA EDU</h1>
                        <h2>INVOICE</h2>
                    </div>
                    
                    <div class="bill-details">
                        <p><strong>Bill ID:</strong> ${billData.billId}</p>
                        <p><strong>Date:</strong> ${billData.date || new Date().toLocaleDateString()}</p>
                        <p><strong>Customer:</strong> ${billData.customer || 'Unknown'}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Unit Price (Rs.)</th>
                                <th>Total (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${billData.items.map(item => `
                                <tr>
                                    <td>${item.bookName}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.unitPrice.toFixed(2)}</td>
                                    <td>${item.totalPrice.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <h3>Total Amount: Rs. ${billData.totalAmount.toFixed(2)}</h3>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Pahana Edu - Quality Educational Materials</p>
                    </div>
                </body>
            </html>
        `;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(billContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
            // printWindow.close(); // Uncomment to close after printing
        };
        
    } catch (error) {
        console.error('Error downloading bill:', error);
        alert('Failed to generate bill PDF. Please try printing the page instead.');
    }
}

// Print bill
function printBill() {
    window.print();
}

// Reset bill
function resetBill() {
    billItems = [];
    totalAmount = 0;
    updateBillDisplay();
    
    const customerSelect = document.getElementById('customerSelect');
    const paymentMethod = document.getElementById('paymentMethod');
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const cvv = document.getElementById('cvv');
    const cardSection = document.getElementById('cardSection');
    const categorySelect = document.getElementById('categorySelect');
    const itemSelect = document.getElementById('itemSelect');
    
    if (customerSelect) customerSelect.value = '';
    if (paymentMethod) paymentMethod.value = '';
    if (cardName) cardName.value = '';
    if (cardNumber) cardNumber.value = '';
    if (cvv) cvv.value = '';
    if (cardSection) cardSection.style.display = 'none';
    if (categorySelect) categorySelect.value = '';
    if (itemSelect) itemSelect.innerHTML = '<option value="">-- Select Book --</option>';
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
    
    .bill-actions {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }
    
    .btn-download, .btn-print {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .btn-download {
        background: #28a745;
        color: white;
    }
    
    .btn-print {
        background: #17a2b8;
        color: white;
    }
    
    .btn-download:hover, .btn-print:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }
    
    @media (max-width: 600px) {
        .bill-actions {
            flex-direction: column;
        }
    }
    
    @media print {
        body * {
            visibility: hidden;
        }
        #billOutput, #billOutput * {
            visibility: visible;
        }
        #billOutput {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
        }
    }
`;
document.head.appendChild(style);

// Add download and print buttons
document.addEventListener('DOMContentLoaded', function() {
    const billOutput = document.getElementById('billOutput');
    if (billOutput) {
        billOutput.insertAdjacentHTML('afterend', `
            <div class="bill-actions">
                <button onclick="downloadBill()" class="btn-download">📄 Download Bill as PDF</button>
                <button onclick="printBill()" class="btn-print">🖨️ Print Bill</button>
            </div>
        `);
    }
});