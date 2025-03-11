// Unified initialization approach
const CaffeineTracker = {
    currentEditId: null,
    entries: [],
    
    initialize: async function() {
        console.log("Initializing caffeine tracking...");
        
        // Bind methods to preserve "this" context
        this.showAddForm = this.showAddForm.bind(this);
        this.hideForm = this.hideForm.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        
        // Set up event listeners for static elements
        this.setupListeners();
        
        // Load and display entries
        const entries = await loadCaffeineEntries();
        if (entries) {
            this.entries = entries;
            displayCaffeineEntries(entries);
        } else {
            // Still display UI even if no entries
            displayCaffeineEntries([]);
        }
    },
    
    setupListeners: function() {
        // Use event delegation for dynamically created buttons
        document.addEventListener('click', (event) => {
            // Handle add button clicks
            if (event.target.id === 'addCaffeineBtn' ||
                (event.target.classList.contains('journal-btn') &&
                 event.target.textContent.includes('Log Caffeine'))) {
                console.log("Caffeine button clicked via delegation");
                this.showAddForm();
            }
            
            // Handle edit button clicks - use a specific class for caffeine edit buttons
            if (event.target.classList.contains('caffeine-edit-btn') && event.target.dataset.id) {
                console.log("Caffeine edit button clicked with ID:", event.target.dataset.id);
                this.editEntry(event.target.dataset.id);
            }
        });
    },
    
    showAddForm: function() {
        console.log("Showing add caffeine form");
        
        // IMPORTANT: Remove any existing container to avoid style inheritance issues
        const existingContainer = document.getElementById('caffeineFormContainer');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create a brand new container each time
        const formContainer = document.createElement('div');
        formContainer.id = 'caffeineFormContainer';
        formContainer.className = 'modal';
        
        // Add to body BEFORE setting innerHTML
        document.body.appendChild(formContainer);
        
        // Set innerHTML after appending to DOM
        formContainer.innerHTML = `
            <div class="modal-content">
                <span class="close">×</span>
                <h2>Log Caffeine Consumption</h2>
                <form id="caffeineForm">
                    <div class="form-group">
                        <label for="beverageType">Beverage Type</label>
                        <select id="beverageType" required>
                            <option value="">Select a beverage</option>
                            <option value="coffee">Coffee</option>
                            <option value="espresso">Espresso</option>
                            <option value="tea">Tea</option>
                            <option value="energy_drink">Energy Drink</option>
                            <option value="soda">Soda</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="caffeineAmount">Caffeine Amount (mg)</label>
                        <input type="number" id="caffeineAmount" required min="1" max="1000">
                    </div>
                    <div class="form-group">
                        <label for="consumedAt">When Consumed</label>
                        <input type="datetime-local" id="consumedAt">
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="submit-btn">Save</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        // Set default date-time to now
        const now = new Date();
        const nowLocalISOString = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('consumedAt').value = nowLocalISOString;
        
        // IMPORTANT: Set display after everything else is ready
        // This ensures all styles are properly computed
        setTimeout(() => {
            formContainer.style.display = 'block';
        }, 0);
        
        // Add event listeners
        const closeBtn = formContainer.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideForm);
        }
        
        const form = document.getElementById('caffeineForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }
        
        const cancelButton = formContainer.querySelector('.cancel-btn');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.hideForm);
        }
    },
    
    hideForm: function() {
        const formContainer = document.getElementById('caffeineFormContainer');
        if (formContainer) {
            // First hide it
            formContainer.style.display = 'none';
            
            // Then completely remove it from DOM to avoid style issues
            setTimeout(() => {
                formContainer.remove();
            }, 100);
        }
    },
    handleFormSubmit: async function(event) {
        event.preventDefault();
        
        // Get form values
        const amount = parseInt(document.getElementById('caffeineAmount').value);
        const type = document.getElementById('beverageType').value;
        const consumedAt = document.getElementById('consumedAt').value || new Date().toISOString();
        
        // VALIDATE DATE - Add this block
        const selectedDate = new Date(consumedAt);
        const currentDate = new Date();
        
        if (selectedDate > currentDate) {
            showToast("You cannot log caffeine consumption for future dates!", "error");
            return; // Stop form submission
        }
        
        try {
            // Get current user
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                showToast("Please sign in to save entries", "error");
                return;
            }
            
            // Log data being sent
            console.log("Saving entry:", {
                user_id: user.id,
                amount: amount,
                beverage_type: type,
                consumed_at: consumedAt
            });
            
            // For editing an existing entry or creating a new one
            let data, error;
            
            if (this.currentEditId) {
                // Update existing entry
                console.log("Updating entry ID:", this.currentEditId);
                
                ({ data, error } = await supabaseClient
                    .from('caffeine_entries')
                    .update({
                        amount: amount,
                        beverage_type: type,
                        consumed_at: consumedAt
                    })
                    .eq('id', this.currentEditId)
                    .select());
                    
                if (error) throw error;
                showToast("Entry updated successfully!", "success");
            } else {
                // Create new entry
                ({ data, error } = await supabaseClient
                    .from('caffeine_entries')
                    .insert([
                        { 
                            user_id: user.id,
                            amount: amount,
                            beverage_type: type,
                            consumed_at: consumedAt
                        }
                    ])
                    .select());
                    
                if (error) throw error;
                showToast("Caffeine entry saved!", "success");
            }
            
            // Reset edit ID
            this.currentEditId = null;
            
            // Hide form
            this.hideForm();
            
            // Reload data and display
            const entries = await loadCaffeineEntries();
            if (entries) {
                this.entries = entries;
                displayCaffeineEntries(entries);
            }
            
        } catch (err) {
            console.error("Error saving caffeine entry:", err);
            showToast("Failed to save entry: " + err.message, "error");
        }
    },    
    editEntry: async function(entryId) {
        this.currentEditId = entryId;
        
        try {
            console.log("Fetching caffeine entry with ID:", entryId);
            
            // Get current user for security check
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                showToast("Please sign in to edit entries", "error");
                return;
            }
            
            const { data, error } = await supabaseClient
                .from('caffeine_entries')
                .select('*')
                .eq('id', entryId)
                .eq('user_id', user.id)  // Security check
                .single();
                
            if (error) throw error;
            
            // Remove any existing container
            const existingContainer = document.getElementById('caffeineFormContainer');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // Create a fresh container
            const formContainer = document.createElement('div');
            formContainer.id = 'caffeineFormContainer';
            formContainer.className = 'modal';
            document.body.appendChild(formContainer);
            
            // Populate with existing values
            formContainer.innerHTML = `
                <div class="modal-content">
                    <span class="close">×</span>
                    <h2>Edit Caffeine Entry</h2>
                    <form id="caffeineForm">
                        <div class="form-group">
                            <label for="beverageType">Beverage Type</label>
                            <select id="beverageType" required>
                                <option value="">Select a beverage</option>
                                <option value="coffee" ${data.beverage_type === 'coffee' ? 'selected' : ''}>Coffee</option>
                                <option value="espresso" ${data.beverage_type === 'espresso' ? 'selected' : ''}>Espresso</option>
                                <option value="tea" ${data.beverage_type === 'tea' ? 'selected' : ''}>Tea</option>
                                <option value="energy_drink" ${data.beverage_type === 'energy_drink' ? 'selected' : ''}>Energy Drink</option>
                                <option value="soda" ${data.beverage_type === 'soda' ? 'selected' : ''}>Soda</option>
                                <option value="other" ${data.beverage_type === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="caffeineAmount">Caffeine Amount (mg)</label>
                            <input type="number" id="caffeineAmount" required min="1" max="1000" value="${data.amount}">
                        </div>
                        <div class="form-group">
                            <label for="consumedAt">When Consumed</label>
                            <input type="datetime-local" id="consumedAt" value="${new Date(data.consumed_at).toISOString().slice(0, 16)}">
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-btn">Update</button>
                            <button type="button" class="cancel-btn">Cancel</button>
                        </div>
                        <div class="delete-button-container">
                            <button type="button" class="delete-btn">Delete Entry</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Set display with a slight delay
            setTimeout(() => {
                formContainer.style.display = 'block';
            }, 0);
            
            // Add event listeners
            const closeBtn = formContainer.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', this.hideForm);
            }
            
            const form = document.getElementById('caffeineForm');
            if (form) {
                form.addEventListener('submit', this.handleFormSubmit);
            }
            
            const cancelButton = formContainer.querySelector('.cancel-btn');
            if (cancelButton) {
                cancelButton.addEventListener('click', this.hideForm);
            }
            
            const deleteButton = formContainer.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => this.deleteEntry(entryId));
            }
            
        } catch (err) {
            console.error("Error loading caffeine entry for edit:", err);
            showToast("Failed to load entry: " + err.message, "error");
        }
    },
    
    deleteEntry: async function(entryId) {
        if (!confirm("Are you sure you want to delete this caffeine entry?")) {
            return;
        }
        
        try {
            const { error } = await supabaseClient
                .from('caffeine_entries')
                .delete()
                .eq('id', entryId);
                
            if (error) throw error;
            
            showToast("Caffeine entry deleted successfully!", "success");
            this.hideForm();
            
            // Reload and display entries
            const entries = await loadCaffeineEntries();
            if (entries) {
                this.entries = entries;
                displayCaffeineEntries(entries);
            } else {
                displayCaffeineEntries([]);
            }
            
        } catch (err) {
            console.error("Error deleting caffeine entry:", err);
            showToast("Failed to delete entry: " + err.message, "error");
        }
    }
};

// Loading caffeine entries from database
async function loadCaffeineEntries() {
    try {
        console.log("Loading caffeine entries...");
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            console.log("No authenticated user");
            return [];
        }
        
        const { data, error } = await supabaseClient
            .from('caffeine_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('consumed_at', { ascending: false });
            
        if (error) throw error;
        
        console.log("Retrieved caffeine entries:", data);
        return data;
        
    } catch (err) {
        console.error("Error loading caffeine entries:", err);
        showToast("Error loading caffeine data", "error");
        return [];
    }
}

// Display caffeine entries in the UI
function displayCaffeineEntries(entries) {
    console.log("Displaying caffeine entries:", entries);
    
    const container = document.querySelector('.feature-card:first-child');
    if (!container) {
        console.error("Could not find container to display caffeine entries");
        return;
    }
    
    // Button to add new caffeine entry
    const addButton = `
        <button id="addCaffeineBtn" class="journal-btn">Log Caffeine</button>
    `;
    
    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <h3>Caffeine Tracker</h3>
            <div class="timer-display">
                <p>No caffeine consumed yet. Good job! ☕</p>
            </div>
            <div class="card-actions">
                ${addButton}
            </div>`;
    } else {
        // Sort entries by consumed_at date (newest first)
        entries.sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at));
        
        // Get the most recent entry
        const lastEntry = entries[0];
        const lastConsumedDate = new Date(lastEntry.consumed_at);
        
        // Calculate time since last caffeine
        const timeSince = getTimeSince(lastConsumedDate);
        
        // Create the HTML for the timer display
        container.innerHTML = `
            <h3>Time Since Last Caffeine</h3>
            <div class="card-content">
                <div id="caffeineTimer" class="metric-display">
                    <span class="time-counter">${timeSince}</span>
                </div>
                <div class="last-entry">
                    <div class="entry-header">
                        <h4>Last Consumption</h4>
                        <button class="caffeine-edit-btn" data-id="${lastEntry.id}">Edit</button>
                    </div>
                    <p>${lastEntry.beverage_type} (${lastEntry.amount}mg)</p>
                    <small>Consumed on ${lastConsumedDate.toLocaleDateString()} at ${lastConsumedDate.toLocaleTimeString()}</small>
                </div>
            </div>
            <div class="card-actions">
                ${addButton}
            </div>
        `;
        
        // Set up interval to update the timer
        updateCaffeineTimer(lastConsumedDate);
    }
}

// Function to calculate time since last caffeine
function getTimeSince(date) {
    const now = new Date();
    const diffMs = now - date;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = '';
    if (days > 0) result += `${days} days `;
    if (hours > 0 || days > 0) result += `${hours} hrs `;
    result += `${minutes} mins`;
    
    return result;
}

// Function to update the timer every minute
function updateCaffeineTimer(lastConsumedDate) {
    // Clear any existing timer
    if (window.caffeineTimerInterval) {
        clearInterval(window.caffeineTimerInterval);
    }
    
    // Update the timer immediately
    const timerElement = document.querySelector('.time-counter');
    if (timerElement) {
        timerElement.textContent = getTimeSince(lastConsumedDate);
    }
    
    // Set up interval to update every minute
    window.caffeineTimerInterval = setInterval(() => {
        const timerElement = document.querySelector('.time-counter');
        if (timerElement) {
            timerElement.textContent = getTimeSince(lastConsumedDate);
        } else {
            // If element no longer exists, clear interval
            clearInterval(window.caffeineTimerInterval);
        }
    }, 60000); // Update every minute
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize caffeine tracking if user is logged in
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            CaffeineTracker.initialize();
        }
    });
});

// Make the tracker functions globally available
window.initializeCaffeineTracking = CaffeineTracker.initialize.bind(CaffeineTracker);
window.showCaffeineForm = CaffeineTracker.showAddForm.bind(CaffeineTracker);
window.hideCaffeineForm = CaffeineTracker.hideForm.bind(CaffeineTracker);

