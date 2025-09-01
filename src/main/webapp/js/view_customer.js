// Function to load customers from backend
function loadCustomers() {
    console.log("Loading customers...");
    
    fetch('http://localhost:8080/Pahana_edu_backend2/GetCustomersServlet', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Customers data:", data);
        if (data.status === 'success') {
            populateCustomerTable(data.customers);
        } else {
            alert('Error loading customers: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error loading customers:', error);
        alert('Failed to load customers. Check console for details.');
    });
}

// Function to populate the table with customer data
function populateCustomerTable(customers) {
    const tableBody = document.querySelector('#customerTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    if (customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No customers found</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${customer.accountNo}</td>
            <td>${customer.name}</td>
            <td>${customer.address}</td>
            <td>${customer.phone}</td>
            <td>${customer.unitsConsumed !== null ? customer.unitsConsumed : 'N/A'}</td>
            <td class="action-links">
                <a href="edit_customer.html?accountNo=${customer.accountNo}" class="edit-link">Edit</a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Function to filter table based on search input
function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('customerTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        let found = false;
        const cells = rows[i].getElementsByTagName('td');
        
        for (let j = 0; j < cells.length - 1; j++) { // Exclude action column
            const cell = cells[j];
            if (cell) {
                if (cell.textContent.toLowerCase().includes(filter)) {
                    found = true;
                    break;
                }
            }
        }
        
        if (found) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// Load customers when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Customer records page loaded");
    loadCustomers();
    
    // Add event listener for search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }
});