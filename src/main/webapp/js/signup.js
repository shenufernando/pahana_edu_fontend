document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    console.log("Form submitted - getting values...");
    
    // Get form values
    const formData = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value.trim(),
        role: document.getElementById("role").value
    };

    console.log("Form data:", formData);

    // Validate
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.role) {
        alert("Please fill in all fields");
        return;
    }

    try {
        console.log("Sending request to backend...");
        
        // Convert to URL-encoded format
        const urlParams = new URLSearchParams();
        urlParams.append('fullName', formData.fullName);
        urlParams.append('email', formData.email);
        urlParams.append('username', formData.username);
        urlParams.append('password', formData.password);
        urlParams.append('role', formData.role);

        const response = await fetch("http://localhost:8080/Pahana_edu_backend2/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: urlParams.toString()
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Server response:", result);
        
        alert(result.message);

        if (result.status === "success") {
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Signup failed:", error);
        alert("Signup failed: " + error.message);
    }
});