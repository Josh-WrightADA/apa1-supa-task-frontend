// Create a new file for wellness tracking functionality
const WellnessTracker = {
    currentEditId: null,
    
    initialize: function() {
        console.log("Initializing wellness tracking...");
        
        // Bind methods to preserve "this" context
        this.showWellnessForm = this.showWellnessForm.bind(this);
        this.hideWellnessForm = this.hideWellnessForm.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        
        this.setupListeners();
        this.loadWellnessData();
    },
    
    setupListeners: function() {
        // Listen for static check-in button
        const checkInBtn = document.querySelector('.check-in-btn');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', this.showWellnessForm);
        }
        
        // Event delegation for dynamically created edit buttons
        document.addEventListener('click', (event) => {
            // Only handle wellness edit buttons
            if (event.target.classList.contains('wellness-edit-btn') && event.target.dataset.id) {
                console.log("Wellness edit button clicked:", event.target.dataset.id);
                this.editEntry(event.target.dataset.id);
            }
        });
    },
    
    showWellnessForm: function() {
        console.log("Showing wellness form");
        
        // IMPORTANT: Remove any existing container to avoid style inheritance issues
        const existingContainer = document.getElementById('wellnessFormContainer');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create a brand new container each time
        const formContainer = document.createElement('div');
        formContainer.id = 'wellnessFormContainer';
        formContainer.className = 'modal';
        
        // Add to body BEFORE setting innerHTML
        document.body.appendChild(formContainer);
        
        // Set innerHTML after appending to DOM
        formContainer.innerHTML = `
            <div class="modal-content">
                <span class="close">×</span>
                <h2>Wellness Check-in</h2>
                <form id="wellnessForm">
                    <div class="form-group">
                        <label for="energyLevel">Energy Level (1-5)</label>
                        <input type="range" id="energyLevel" min="1" max="5" value="3" class="slider">
                        <div class="range-value" id="energyValue">3</div>
                    </div>
                    <div class="form-group">
                        <label for="moodLevel">Mood (1-5)</label>
                        <input type="range" id="moodLevel" min="1" max="5" value="3" class="slider">
                        <div class="range-value" id="moodValue">3</div>
                    </div>
                    <div class="form-group">
                        <label for="cravingLevel">Caffeine Craving (1-5)</label>
                        <input type="range" id="cravingLevel" min="1" max="5" value="3" class="slider">
                        <div class="range-value" id="cravingValue">3</div>
                    </div>
                    <div class="form-group">
                        <label for="wellnessNotes">Notes (Optional)</label>
                        <textarea id="wellnessNotes" rows="3"></textarea>
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="submit-btn">Save</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        // IMPORTANT: Set display after everything else is ready
        // This ensures all styles are properly computed
        setTimeout(() => {
            formContainer.style.display = 'block';
        }, 0);
        
        // Add event listeners
        const closeBtn = formContainer.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideWellnessForm);
        }
        
        const form = document.getElementById('wellnessForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }
        
        const cancelButton = formContainer.querySelector('.cancel-btn');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.hideWellnessForm);
        }
        
        // Add listeners for range sliders
        document.getElementById('energyLevel').addEventListener('input', function() {
            document.getElementById('energyValue').textContent = this.value;
        });
        document.getElementById('moodLevel').addEventListener('input', function() {
            document.getElementById('moodValue').textContent = this.value;
        });
        document.getElementById('cravingLevel').addEventListener('input', function() {
            document.getElementById('cravingValue').textContent = this.value;
        });
    },
    
    hideWellnessForm: function() {
        const formContainer = document.getElementById('wellnessFormContainer');
        if (formContainer) {
            // First hide it
            formContainer.style.display = 'none';
            
            // Then completely remove it from DOM to avoid style issues
            setTimeout(() => {
                formContainer.remove();
            }, 100);
        }
    },
    
    editEntry: async function(entryId) {
        console.log("WellnessTracker.editEntry called with ID:", entryId);
        this.currentEditId = entryId;
        
        try {
            // Get current user for security check
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                showToast("Please sign in to edit entries", "error");
                return;
            }
            
            // IMPORTANT: Use the correct table - wellness_checkins not caffeine_entries
            const { data, error } = await supabaseClient
                .from('wellness_checkins') // Correct table name
                .select('*')
                .eq('id', entryId)
                .eq('user_id', user.id)  // Security check
                .single();
                
            if (error) throw error;
            
            console.log("Fetched wellness entry:", data);
            
            // Remove any existing container
            const existingContainer = document.getElementById('wellnessFormContainer');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // Create a fresh container
            const formContainer = document.createElement('div');
            formContainer.id = 'wellnessFormContainer';
            formContainer.className = 'modal';
            document.body.appendChild(formContainer);
            
            // Populate with existing values
            formContainer.innerHTML = `
                <div class="modal-content">
                    <span class="close">×</span>
                    <h2>Edit Wellness Check-in</h2>
                    <form id="wellnessForm">
                        <div class="form-group">
                            <label for="energyLevel">Energy Level (1-5)</label>
                            <input type="range" id="energyLevel" min="1" max="5" value="${data.energy_level}" class="slider">
                            <div class="range-value" id="energyValue">${data.energy_level}</div>
                        </div>
                        <div class="form-group">
                            <label for="moodLevel">Mood (1-5)</label>
                            <input type="range" id="moodLevel" min="1" max="5" value="${data.mood}" class="slider">
                            <div class="range-value" id="moodValue">${data.mood}</div>
                        </div>
                        <div class="form-group">
                            <label for="cravingLevel">Caffeine Craving (1-5)</label>
                            <input type="range" id="cravingLevel" min="1" max="5" value="${data.caffeine_craving}" class="slider">
                            <div class="range-value" id="cravingValue">${data.caffeine_craving}</div>
                        </div>
                        <div class="form-group">
                            <label for="wellnessNotes">Notes (Optional)</label>
                            <textarea id="wellnessNotes" rows="3">${data.notes || ''}</textarea>
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
                closeBtn.addEventListener('click', this.hideWellnessForm);
            }
            
            const form = document.getElementById('wellnessForm');
            if (form) {
                form.addEventListener('submit', this.handleFormSubmit);
            }
            
            const cancelButton = formContainer.querySelector('.cancel-btn');
            if (cancelButton) {
                cancelButton.addEventListener('click', this.hideWellnessForm);
            }
            
            const deleteButton = formContainer.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => this.deleteEntry(entryId));
            }
            
            // Add listeners for range sliders
            document.getElementById('energyLevel').addEventListener('input', function() {
                document.getElementById('energyValue').textContent = this.value;
            });
            document.getElementById('moodLevel').addEventListener('input', function() {
                document.getElementById('moodValue').textContent = this.value;
            });
            document.getElementById('cravingLevel').addEventListener('input', function() {
                document.getElementById('cravingValue').textContent = this.value;
            });
            
        } catch (err) {
            console.error("Error loading wellness check-in for edit:", err);
            showToast("Failed to load entry: " + err.message, "error");
        }
    },
    
    deleteEntry: async function(entryId) {
        // Ask for confirmation
        if (!confirm("Are you sure you want to delete this wellness check-in?")) {
            return;
        }
        
        try {
            // Delete from Supabase - IMPORTANT: Use wellness_checkins table
            const { error } = await supabaseClient
                .from('wellness_checkins')
                .delete()
                .eq('id', entryId);
                
            if (error) throw error;
            
            showToast("Wellness check-in deleted successfully!", "success");
            this.hideWellnessForm();
            
            // Reload data and update chart
            this.loadWellnessData();
            
        } catch (err) {
            console.error("Error deleting wellness check-in:", err);
            showToast("Failed to delete entry: " + err.message, "error");
        }
    },
    
    handleFormSubmit: async function(event) {
        event.preventDefault();
        
        // Get form values
        const energyLevel = parseInt(document.getElementById('energyLevel').value);
        const mood = parseInt(document.getElementById('moodLevel').value);
        const caffeineCraving = parseInt(document.getElementById('cravingLevel').value);
        const notes = document.getElementById('wellnessNotes').value;
        
        try {
            // Get current user
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                showToast("Please sign in to save entries", "error");
                return;
            }
            
            let data, error;
            
            // If editing an existing entry
            if (this.currentEditId) {
                console.log("Updating wellness check-in:", this.currentEditId);
                
                // Update in Supabase
                ({ data, error } = await supabaseClient
                    .from('wellness_checkins')
                    .update({
                        energy_level: energyLevel,
                        mood: mood,
                        caffeine_craving: caffeineCraving,
                        notes: notes
                    })
                    .eq('id', this.currentEditId)
                    .select());
                    
                if (error) throw error;
                
                showToast("Wellness check-in updated successfully!", "success");
            } else {
                // Creating a new entry
                console.log("Creating new wellness check-in");
                
                // Save to Supabase
                ({ data, error } = await supabaseClient
                    .from('wellness_checkins')
                    .insert([
                        { 
                            user_id: user.id,
                            energy_level: energyLevel,
                            mood: mood,
                            caffeine_craving: caffeineCraving,
                            notes: notes
                        }
                    ])
                    .select());
                    
                if (error) throw error;
                
                showToast("Wellness check-in saved!", "success");
            }
            
            // Reset edit ID
            this.currentEditId = null;
            
            // Hide form
            this.hideWellnessForm();
            
            // Reload data and update chart
            this.loadWellnessData();
            
        } catch (err) {
            console.error("Error saving wellness check-in:", err);
            showToast("Failed to save entry: " + err.message, "error");
        }
    },
    
    loadWellnessData: async function() {
        try {
            // Get current user
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) return;
            
            // Get the last 7 days of check-ins
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            
            const { data, error } = await supabaseClient
                .from('wellness_checkins')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });
                
            if (error) throw error;
            
            console.log("Retrieved wellness data:", data);
            
            // Display entries and update chart
            this.displayWellnessEntries(data);
            updateWellnessChart(data);
            
        } catch (err) {
            console.error("Error loading wellness data:", err);
        }
    },
    
    displayWellnessEntries: function(entries) {
        console.log("Displaying wellness entries:", entries);
        
        // Find the wellness card
        const container = document.querySelector('.feature-card:nth-child(2)');
        if (!container) {
            console.error("Could not find container to display wellness entries");
            return;
        }
        
        // Create check-in button
        const checkInBtn = `<button class="check-in-btn journal-btn">Log Status</button>`;
        
        if (!entries || entries.length === 0) {
            // No entries
            container.innerHTML = `
                <h3>Wellness Check-in</h3>
                <p>Track your mood, energy, and caffeine cravings</p>
                <div class="card-actions">
                    ${checkInBtn}
                </div>
            `;
        } else {
            // Sort entries by created_at date (newest first)
            entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            // Get the most recent entry
            const lastEntry = entries[0];
            const lastCheckinDate = new Date(lastEntry.created_at);
            
            // Create the HTML for the wellness display
            container.innerHTML = `
                <h3>Wellness Check-in</h3>
                <div class="card-content">
                    <div class="last-entry">
                        <div class="entry-header">
                            <h4>Latest Check-in</h4>
                            <button class="wellness-edit-btn" data-id="${lastEntry.id}">Edit</button>
                        </div>
                        <div class="metrics">
                            <div class="metric">
                                <span>Energy: ${lastEntry.energy_level}/5</span>
                                <div class="meter">
                                    <div class="meter-fill" style="width:${lastEntry.energy_level*20}%"></div>
                                </div>
                            </div>
                            <div class="metric">
                                <span>Mood: ${lastEntry.mood}/5</span>
                                <div class="meter">
                                    <div class="meter-fill" style="width:${lastEntry.mood*20}%"></div>
                                </div>
                            </div>
                            <div class="metric">
                                <span>Cravings: ${lastEntry.caffeine_craving}/5</span>
                                <div class="meter">
                                    <div class="meter-fill" style="width:${lastEntry.caffeine_craving*20}%"></div>
                                </div>
                            </div>
                        </div>
                        <small>Recorded on ${lastCheckinDate.toLocaleDateString()} at ${lastCheckinDate.toLocaleTimeString()}</small>
                    </div>
                </div>
                <div class="card-actions">
                    ${checkInBtn}
                </div>
            `;
        }
        
        // Add event listener to the check-in button
        const newCheckInBtn = container.querySelector('.check-in-btn');
        if (newCheckInBtn) {
            newCheckInBtn.addEventListener('click', this.showWellnessForm);
        }
    }
};

function updateWellnessChart(wellnessData) {
    // Use a DIFFERENT canvas ID
    const chartCanvas = document.getElementById('wellnessChart');
    
    if (!chartCanvas) {
        console.error("Wellness chart canvas not found");
        return;
    }
    
    // Make sure this canvas is visible, the other is hidden
    chartCanvas.style.display = 'block';
    const statsChart = document.getElementById('statsChart');
    if (statsChart) statsChart.style.display = 'none';
    
    // Still clean up any existing charts on this canvas
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create new chart with wellness data
    const ctx = chartCanvas.getContext('2d');
    
    // Prepare data arrays
    const dates = wellnessData.map(entry => {
        const date = new Date(entry.created_at);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const energyData = wellnessData.map(entry => entry.energy_level);
    const moodData = wellnessData.map(entry => entry.mood);
    const cravingData = wellnessData.map(entry => entry.caffeine_craving);
    
    // If no data, use placeholders
    if (wellnessData.length === 0) {
        dates.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
        energyData.push(3, 3, 3, 3, 3, 3, 3);
        moodData.push(3, 3, 3, 3, 3, 3, 3);
        cravingData.push(3, 3, 3, 3, 3, 3, 3);
    }
    
    // Create new chart and store reference
    window.wellnessChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Energy Level',
                    data: energyData,
                    borderColor: '#8b5e3c',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Mood',
                    data: moodData,
                    borderColor: '#6d4c41',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Caffeine Cravings',
                    data: cravingData,
                    borderColor: '#4b2e1a',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4b2e1a'
                    }
                },
                tooltip: {
                    backgroundColor: '#4b2e1a',
                    titleColor: '#f5e1c5',
                    bodyColor: '#f5e1c5'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        color: '#4b2e1a'
                    },
                    grid: {
                        color: 'rgba(75, 46, 26, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#4b2e1a'
                    },
                    grid: {
                        color: 'rgba(75, 46, 26, 0.1)'
                    }
                }
            }
        }
    });
}// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize wellness tracking if user is logged in
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            WellnessTracker.initialize();
        }
    });
});

// Make functions available for global access
window.initializeWellnessTracking = WellnessTracker.initialize.bind(WellnessTracker);
window.showWellnessForm = WellnessTracker.showWellnessForm.bind(WellnessTracker);
window.hideWellnessForm = WellnessTracker.hideWellnessForm.bind(WellnessTracker);
