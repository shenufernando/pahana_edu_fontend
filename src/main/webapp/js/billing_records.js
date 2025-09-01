document.addEventListener('DOMContentLoaded', function () {
    fetchBills();

    function fetchBills() {
        fetch('http://localhost:8080/Pahana_edu_backend2/GetBillsServlet')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received JSON:', data); // Log entire JSON response
                const tableBody = document.querySelector('#billsTable tbody');
                tableBody.innerHTML = ''; // Clear existing rows

                data.forEach(bill => {
                    // Log each bill to identify problematic ones
                    console.log('Processing bill:', bill);

                    // Safely handle missing fields
                    const billId = bill.billId || 'N/A';
                    const createdAt = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A';
                    const customerName = bill.customerName || 'Unknown';
                    const itemsList = bill.items && Array.isArray(bill.items) 
                        ? bill.items.map(item => `${item.bookTitle || 'Unknown'} (x${item.quantity || 0})`).join(', ')
                        : 'No items';
                    const totalAmount = typeof bill.totalAmount === 'number' && !isNaN(bill.totalAmount) 
                        ? bill.totalAmount.toFixed(2) 
                        : '0.00';
                    const paymentMethod = bill.paymentMethod || 'N/A';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${billId}</td>
                        <td>${createdAt}</td>
                        <td>${customerName}</td>
                        <td>${itemsList}</td>
                        <td>${totalAmount}</td>
                        <td>${paymentMethod}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching bills:', error);
                alert('Failed to load billing records: ' + error.message);
            });
    }

    // Search functionality
    window.filterTable = function () {
        const input = document.getElementById('searchInput').value.toLowerCase();
        const rows = document.querySelectorAll('#billsTable tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const billId = cells[0].textContent.toLowerCase();
            const customerName = cells[2].textContent.toLowerCase();
            const items = cells[3].textContent.toLowerCase();
            const paymentMethod = cells[5].textContent.toLowerCase();

            if (billId.includes(input) || customerName.includes(input) || 
                items.includes(input) || paymentMethod.includes(input)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };
});