function cleanupCharts() {
    // Clean up any existing charts to prevent conflicts
    const canvases = ['statsChart', 'wellnessChart'];
    
    canvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            try {
                // Check if Chart is defined and has the getChart method
                if (typeof Chart !== 'undefined' && Chart.getChart) {
                    const chart = Chart.getChart(canvas);
                    if (chart) {
                        console.log(`Destroying chart on ${canvasId}`);
                        chart.destroy();
                    }
                }
            } catch (e) {
                console.error(`Error cleaning up chart on ${canvasId}:`, e);
            }
        }
    });
}

const { createClient } = supabase;

const supabaseClient = createClient(
    "https://exfoarzguxjwoaquiuin.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Zm9hcnpndXhqd29hcXVpdWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTI2OTcsImV4cCI6MjA1NTYyODY5N30.uE9x768lAgM9pAQzldx7E3r0xcXzNw7ltSyVTSmeuDc"
);

function setupModalListeners() {
    const modal = document.getElementById('authModal');
    const registerModal = document.getElementById('registerModal');
    const signInBtn = document.querySelector('.signInBtn');
    const registerBtn = document.querySelector('.registerBtn');
    const closeBtn = document.querySelector('.close');
    const closeRegisterBtn = document.querySelector('.close-register');

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showToast("Passwords don't match!", 'error');
            return;
        }
        await signUp(email, password);
    });

    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await signIn(email, password);
    });

    signInBtn.addEventListener('click', () => {
        if (signInBtn.textContent === 'Sign Out') {
            supabaseClient.auth.signOut();
        } else {
            document.getElementById('modalTitle').textContent = 'Sign in';
            modal.style.display = 'block';
        }
    });

    registerBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Register';
        registerModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    closeRegisterBtn.addEventListener('click', () => registerModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
        if (event.target === registerModal) registerModal.style.display = 'none';
    });
}

async function signUp(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        
        showToast("Sign-up successful! Check your email to confirm.", 'success');
        document.getElementById('registerModal').style.display = 'none';
    } catch (err) {
        console.error("Registration error:", err);
        showToast("Error during registration.", 'error');
    }
}
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            showToast("Account not found. Please register.", 'error');
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
        } else {
            showToast(error.message, 'error');
        }
    } else {
        document.getElementById('authModal').style.display = 'none';
        showToast("Welcome back! ☕", 'success');
    }
}

function loadNavbar() {
    return fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            return supabaseClient.auth.getSession();
        })
        .then(({ data: { session } }) => {
            if (session) {
                const signInBtn = document.querySelector('.signInBtn');
                const registerBtn = document.querySelector('.registerBtn');
                const landingContainer = document.querySelector('.landing-container');
                const welcomeContainer = document.querySelector('.welcome-container');
                
                signInBtn.textContent = 'Sign Out';
                registerBtn.style.display = 'none';
                welcomeContainer.style.display = 'none';
                landingContainer.style.display = 'block';
            }
        });
}
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar().then(() => {
        setupModalListeners();
        cleanupCharts(); // Clean up first
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            // Initialize charts only once
            initializeCharts();
            
            // Then check if user is logged in and initialize other components
            supabaseClient.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    // These should update the chart, not recreate it
                    if (typeof initializeCaffeineTracking === 'function') {
                        initializeCaffeineTracking();
                    }
                    if (typeof initializeWellnessTracking === 'function') {
                        initializeWellnessTracking();
                    }
                }
            });
        }, 100);
    });
});
supabaseClient.auth.onAuthStateChange((event, session) => {
    // Delay the DOM updates to ensure elements are loaded
    setTimeout(() => {
        const signInBtn = document.querySelector('.signInBtn');
        const registerBtn = document.querySelector('.registerBtn');
        const landingContainer = document.querySelector('.landing-container');
        const welcomeContainer = document.querySelector('.welcome-container');
        
        if (session) {
            if (signInBtn) signInBtn.textContent = 'Sign Out';
            if (registerBtn) registerBtn.style.display = 'none';
            if (welcomeContainer) welcomeContainer.style.display = 'none';
            if (landingContainer) landingContainer.style.display = 'block';
            
            // Initialize caffeine and wellness tracking when user logs in
            if (typeof initializeCaffeineTracking === 'function') {
                initializeCaffeineTracking();
            }
            if (typeof initializeWellnessTracking === 'function') {
                initializeWellnessTracking();
            }
        } else {
            if (signInBtn) signInBtn.textContent = 'Sign In';
            if (registerBtn) registerBtn.style.display = 'block';
            if (landingContainer) landingContainer.style.display = 'none';
            if (welcomeContainer) welcomeContainer.style.display = 'block';
        }
    }, 100); // Small delay to ensure DOM is ready
});
let activeToastTimer = null;

function showToast(message, type = 'success') {
    // Clear any existing toast and timer
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    if (activeToastTimer) {
        clearTimeout(activeToastTimer);
        activeToastTimer = null;
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icon = type === 'success' ? '✓' : '⚠';
    toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
    document.body.appendChild(toast);
    
    // Filter out database errors for registration
    if (message.includes("database error registering new user")) {
        // Don't show this error if we've just shown a registration success message
        const successToast = document.querySelector('.toast-success');
        if (successToast && successToast.textContent.includes("email to confirm")) {
            toast.remove();
            return;
        }
    }
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Set timer to hide toast
    activeToastTimer = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            activeToastTimer = null;
        }, 300);
    }, 3000);
}
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}
