// Initialize Supabase client
const supabase = supabase.createClient(
  "https://exfoarzguxjwoaquiuin.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Zm9hcnpndXhqd29hcXVpdWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTI2OTcsImV4cCI6MjA1NTYyODY5N30.uE9x768lAgM9pAQzldx7E3r0xcXzNw7ltSyVTSmeuDc"
);

// Sign-up (Register)
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign-up error:", error.message);
    alert("Error: " + error.message);
  } else {
    alert("Sign-up successful! Check your email to confirm.");
  }
}

// Sign-in (Login)
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    alert("Error: " + error.message);
  } else {
    alert("Sign-in successful! Redirecting...");
    window.location.href = "/placeholder.html"; // Change this to your actual dashboard page
  }
}

// Handling modal form submission
document.getElementById("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const modalTitle = document.getElementById("modalTitle").textContent;

  if (email && password) {
    if (modalTitle.includes("Sign in")) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  }
});

// Show/hide modal
const authModal = document.getElementById("authModal");
const closeModal = document.querySelector(".close");

// Show modal when sign-in or register is clicked
document.querySelector(".signInBtn").addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "Sign in";
  authModal.style.display = "block";
});

document.querySelector(".registerBtn").addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "Register";
  authModal.style.display = "block";
});

// Close modal when 'X' is clicked
closeModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === authModal) {
    authModal.style.display = "none";
  }
});

const getMessages = async () => {
  const resultElement = document.getElementById("result");
  resultElement.textContent = "Loading...";

  try {
    const response = await fetch(`/api/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    resultElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (error) {
    resultElement.textContent = `Error: ${error.message}`;
  }
};

const postMessage = async () => {
  const resultElement = document.getElementById("result");
  resultElement.textContent = "Loading...";

  try {
    const response = await fetch(`/api/new_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "If you can see this POST is working :)" }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    resultElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (error) {
    resultElement.textContent = `Error: ${error.message}`;
  }
};

document
  .getElementById("callFunction")
  .addEventListener("click", getMessages);

// To begin try adding another button to use the postMessage function
