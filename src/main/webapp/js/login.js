document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    console.log("Login form submitted...");
    
    // Get form values
    const formData = {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value.trim()
    };

    console.log("Login data:", formData);

    // Validate
    if (!formData.username || !formData.password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        console.log("Sending login request...");
        
        // Convert to URL-encoded format
        const urlParams = new URLSearchParams();
        urlParams.append('username', formData.username);
        urlParams.append('password', formData.password);

        const response = await fetch("http://localhost:8080/Pahana_edu_backend2/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: urlParams.toString(),
            credentials: "include" // Important for sessions/cookies
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Server response:", result);
        
        alert(result.message);

        if (result.status === "success") {
            // Store user info in localStorage
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("username", formData.username);
            localStorage.setItem("role", result.role);
            localStorage.setItem("fullName", result.fullName);
            
            // Redirect to appropriate dashboard
            window.location.href = result.redirect;
        }
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
    }
});