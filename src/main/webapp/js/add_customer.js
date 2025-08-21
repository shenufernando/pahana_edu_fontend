console.log("JavaScript file is loading!");

// Basic form handler
document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Form would submit here!");
    console.log("Form submitted!");
});

// Make all form elements visible
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded!");
    
    // Force show all form elements
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.display = 'block';
        input.style.visibility = 'visible';
        input.style.opacity = '1';
    });
});