document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
});

function loadUsers() {
    fetch('http://localhost:8080/Pahana_edu_backend2/GetUserServlet')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            const tableBody = document.querySelector('#userTable tbody');
            tableBody.innerHTML = ''; // Clear existing content
            
            users.forEach(user => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${user.userId}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteUser(${user.userId}, '${user.email}')">Delete</button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
            alert('Error loading users. Please try again.');
        });
}

function deleteUser(userId, userEmail) {
    if (!confirm('Are you sure you want to delete user: ' + userEmail + '?')) {
        return;
    }
    
    console.log("Attempting to delete user email:", userEmail);
    
    // Create form data with email
    const formData = new FormData();
    formData.append('email', userEmail);  // Make sure this is 'email' not 'userId'
    
    // Send delete request
    fetch('http://localhost:8080/Pahana_edu_backend2/DeleteUserServlet', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.json().then(data => {
            console.log("Server response:", data);
            if (!response.ok) {
                throw new Error(data.message || 'Delete failed');
            }
            return data;
        });
    })
    .then(result => {
        if (result.status === 'success') {
            alert(result.message);
            loadUsers(); // Reload the user list
        } else {
            throw new Error(result.message || 'Delete failed');
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    });
}