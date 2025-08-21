// Global variables
let billItems = [];
let totalAmount = 0;

// Load when page is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Billing page loaded");
    loadCustomers();
    setupEventListeners();
});

// Load customers for dropdown
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:8080/Pahana_edu_backend2/GetCustomersServlet', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const result = await response.json();
        
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

// Setup event listeners
function setupEventListeners() {
    // Payment method toggle
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const cardSection = document.getElementById('cardSection');
        cardSection.style.display = this.value === 'card' ? 'block' : 'none';
    });
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addItemToBill);
    
    // Card number formatting
    document.getElementById('cardNumber')?.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        this.value = value.replace(/(\d{4})/g, '$1-').replace(/-$/, '');
    });
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
    
    const totalPrice = unitPrice * quantity;
    
    // Add to bill items
    billItems.push({
        bookCode: bookCode,
        bookName: bookText.split(' - ')[0],
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice
    });
    
    // Update total
    totalAmount += totalPrice;
    updateBillDisplay();
    
    // Reset selection
    bookSelect.value = '';
    quantityInput.value = '1';
}

// Update bill display
function updateBillDisplay() {
    const totalElement = document.getElementById('totalAmount');
    const billOutput = document.getElementById('billOutput');
    
    totalElement.textContent = totalAmount.toFixed(2);
    
    // Create bill preview
    let billText = '=== PAHANA EDU BILL ===\n\n';
    billText += 'Items:\n';
    
    billItems.forEach((item, index) => {
        billText += `${index + 1}. ${item.bookName} x ${item.quantity} = Rs. ${item.totalPrice.toFixed(2)}\n`;
    });
    
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
    }
    
    try {
        // Prepare bill data
        const billData = {
            customerId: customerSelect.value,
            paymentMethod: paymentMethod.value,
            cardName: cardName.value,
            cardNumber: cardNumber.value,
            cvv: cvv.value,
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
                cardName: billData.cardName || '',
                cardNumber: billData.cardNumber || '',
                cvv: billData.cvv || '',
                items: JSON.stringify(billData.items)
            }),
            credentials: 'include'
        });
        
        const result = await response.json();
        console.log('Bill response:', result);
        
        if (result.status === 'success') {
            alert(`Bill generated successfully!\nBill ID: ${result.billId}\nTotal: Rs. ${result.totalAmount}`);
            resetBill();
        } else {
            throw new Error(result.message || 'Failed to generate bill');
        }
        
    } catch (error) {
        console.error('Error generating bill:', error);
        alert('Failed to generate bill: ' + error.message);
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
    }
    
    button:hover {
        background: #ff9900;
    }
    
    .total-price {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        color: #003366;
    }
    
    #billOutput {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        font-family: monospace;
        white-space: pre-wrap;
        margin-top: 20px;
    }
    
    #cardSection {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
    }
`;
document.head.appendChild(style);

