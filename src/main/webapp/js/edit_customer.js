console.log("Edit customer JavaScript loaded!");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Get account number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accountNo = urlParams.get('accountNo');
    
    console.log("Account number from URL:", accountNo);
    
    if (!accountNo) {
        alert('No customer account number provided!');
        window.location.href = 'view_customers.html';
        return;
    }
    
    // Load customer data
    loadCustomerData(accountNo);
    
    // Setup form submission
    const editForm = document.getElementById('editCustomerForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCustomer(accountNo);
        });
    }
    
    // Real-time phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
    }
});

// Function to load customer data
function loadCustomerData(accountNo) {
    console.log("Loading customer data for account:", accountNo);
    
    // Show loading state
    document.getElementById('accountNoDisplay').textContent = 'Account Number: Loading...';
    
    // First, let's test if the servlet is reachable
    console.log("Testing servlet URL...");
    
    fetch(`http://localhost:8080/Pahana_edu_backend2/GetCustomerServlet?accountNo=${accountNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        console.log("Response status:", response.status, response.statusText);
        console.log("Response headers:", response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Full response data:", data);
        
        if (data.status === 'success') {
            console.log("Customer data received:", data.customer);
            populateForm(data.customer);
        } else {
            alert('Error loading customer: ' + data.message);
            window.location.href = 'view_customers.html';
        }
    })
    .catch(error => {
        console.error('Error loading customer:', error);
        console.error('Error details:', error.message);
        
        // Show detailed error information
        alert('Failed to load customer data. Please check:\n1. Backend server is running\n2. CORS headers are set\n3. Check browser console for details');
        
        // For debugging, let's try to see what the actual response is
        fetch(`http://localhost:8080/Pahana_edu_backend2/GetCustomerServlet?accountNo=${accountNo}`)
            .then(rawResponse => rawResponse.text())
            .then(text => {
                console.log("Raw response text:", text);
            })
            .catch(textError => {
                console.error("Couldn't get raw response:", textError);
            });
    });
}

// Function to populate form with customer data
function populateForm(customer) {
    console.log("Populating form with customer data:", customer);
    
    if (!customer) {
        console.error("No customer data provided to populateForm");
        return;
    }
    
    document.getElementById('accountNoDisplay').textContent = `Account Number: ${customer.accountNo}`;
    document.getElementById('accountNo').value = customer.accountNo;
    document.getElementById('name').value = customer.name || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('phone').value = customer.phone || '';
    
    if (customer.unitsConsumed !== null && customer.unitsConsumed !== undefined) {
        document.getElementById('unitsConsumed').value = customer.unitsConsumed;
    } else {
        document.getElementById('unitsConsumed').value = '';
    }
    
    console.log("Form populated successfully");
}

// Function to update customer
function updateCustomer(accountNo) {
    console.log("Updating customer:", accountNo);
    
    const form = document.getElementById('editCustomerForm');
    const formData = new FormData(form);
    const submitButton = form.querySelector('input[type="submit"]');
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.value = 'Updating...';
    
    // Convert FormData to URL-encoded format
    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
        params.append(key, value);
        console.log(`${key}: ${value}`);
    }
    
    fetch('http://localhost:8080/Pahana_edu_backend2/UpdateCustomerServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(response => {
        console.log("Update response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Update response data:", data);
        if (data.status === 'success') {
            alert('Customer updated successfully!');
            window.location.href = 'view_customers.html';
        } else {
            alert('Error updating customer: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating customer:', error);
        alert('Failed to update customer. Check console for details.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.value = 'Update Customer';
    });
}