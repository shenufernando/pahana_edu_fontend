console.log("JavaScript file is loading!");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded!");
    
    const customerForm = document.getElementById('customerForm');
    
    if (!customerForm) {
        console.error("Form not found!");
        return;
    }
    
    customerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted!");
        
        // Get all form values for debugging
        const formData = new FormData(customerForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
            console.log(`${key}: ${value}`);
        }
        
        const submitButton = customerForm.querySelector('input[type="submit"]');
        submitButton.disabled = true;
        submitButton.value = 'Saving...';
        
        // Convert to x-www-form-urlencoded format
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        
        console.log("Sending to:", 'http://localhost:8080/Pahana_edu_backend2/AddCustomerServlet');
        
        // Make the fetch request
        fetch('http://localhost:8080/Pahana_edu_backend2/AddCustomerServlet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        })
        .then(response => {
            console.log("Response status:", response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Full response:", data);
            if (data.status === 'success') {
                alert('Customer added successfully!' + (data.accountNo ? '\nAccount Number: ' + data.accountNo : ''));
                customerForm.reset();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('Failed to connect to server. Check console for details.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.value = 'Save Customer';
        });
    });
});