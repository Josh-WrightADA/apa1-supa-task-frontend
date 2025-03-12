const WellnessTracker = {
  currentEditId: null,
  
  initialize: function() {
      console.log("Initializing wellness tracking...");
      this.setupListeners();
      this.loadWellnessData();
      this.addCoffeeMascot(); // Add coffee mascot during initialization
  },
  
  setupListeners: function() {
      const checkInBtn = document.querySelector('.check-in-btn');
      if (checkInBtn) {
          checkInBtn.addEventListener('click', this.showWellnessForm);
      }
  },
  
  showWellnessForm: function() {
      // Create modal form similar to caffeine form
      let formContainer = document.getElementById('wellnessFormContainer');
      
      if (!formContainer) {
          formContainer = document.createElement('div');
          formContainer.id = 'wellnessFormContainer';
          formContainer.className = 'modal';
          document.body.appendChild(formContainer);
      }
      
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
      
      // Show form
      formContainer.style.display = 'block';
      
      // Add event listeners
      document.querySelector('#wellnessFormContainer .close').addEventListener('click', WellnessTracker.hideWellnessForm);
      document.querySelector('#wellnessFormContainer .cancel-btn').addEventListener('click', WellnessTracker.hideWellnessForm);
      document.getElementById('wellnessForm').addEventListener('submit', WellnessTracker.handleFormSubmit);
      
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
          formContainer.style.display = 'none';
      }
  },
  
  editEntry: async function(entryId) {
      this.currentEditId = entryId;
      
      try {
          // Get the entry data
          const { data, error } = await supabaseClient
              .from('wellness_checkins')
              .select('*')
              .eq('id', entryId)
              .single();
              
          if (error) throw error;
          
          // Show form with pre-filled data
          let formContainer = document.getElementById('wellnessFormContainer');
          
          if (!formContainer) {
              formContainer = document.createElement('div');
              formContainer.id = 'wellnessFormContainer';
              formContainer.className = 'modal';
              document.body.appendChild(formContainer);
          }
          
          // Populate form HTML with existing values
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
                          <button type="button" class="delete-btn">Delete Entry</button>
                      </div>
                  </form>
              </div>
          `;
          
          // Show form
          formContainer.style.display = 'block';
          
          // Add event listeners
          document.querySelector('#wellnessFormContainer .close').addEventListener('click', WellnessTracker.hideWellnessForm);
          document.querySelector('#wellnessFormContainer .cancel-btn').addEventListener('click', WellnessTracker.hideWellnessForm);
          document.getElementById('wellnessForm').addEventListener('submit', WellnessTracker.handleFormSubmit);
          document.querySelector('#wellnessFormContainer .delete-btn').addEventListener('click', () => WellnessTracker.deleteEntry(entryId));
          
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
          // Delete from Supabase
          const { error } = await supabaseClient
              .from('wellness_checkins')
              .delete()
              .eq('id', entryId);
              
          if (error) throw error;
          
          showToast("Wellness check-in deleted successfully!", "success");
          WellnessTracker.hideWellnessForm();
          
          // Reload data and update chart
          WellnessTracker.loadWellnessData();
          
      } catch (err) {
          console.error("Error deleting wellness check-in:", err);
          showToast("Failed to delete entry: " + err.message, "error");
      }
  },
  
  handleFormSubmit: async function(event) {
      event.preventDefault();
      event.stopPropagation(); // Stop propagation to prevent other handlers
      
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
          if (WellnessTracker.currentEditId) {
              console.log("Updating wellness check-in:", WellnessTracker.currentEditId);
              
              // Update in Supabase
              ({ data, error } = await supabaseClient
                  .from('wellness_checkins')
                  .update({
                      energy_level: energyLevel,
                      mood: mood,
                      caffeine_craving: caffeineCraving,
                      notes: notes
                  })
                  .eq('id', WellnessTracker.currentEditId)
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
          WellnessTracker.currentEditId = null;
          
          // Force hide the wellness form
          const wellnessFormContainer = document.getElementById('wellnessFormContainer');
          if (wellnessFormContainer) {
              wellnessFormContainer.style.display = 'none';
              
           
              setTimeout(() => {
                  wellnessFormContainer.innerHTML = "";
                  
                  // Then load wellness data after a small delay
                  setTimeout(() => {
                      WellnessTracker.loadWellnessData();
                  }, 50);
              }, 10);
          }
          
          // Immediately return false to prevent any other handlers
          return false;
          
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
          
          // Display last entry if we have data
          if (data && data.length > 0) {
              // Get most recent entry
              const lastEntry = data[data.length - 1];
              
              // Find the wellness card (second feature card)
              const wellnessCard = document.querySelector('.feature-card:nth-child(2)');
              if (wellnessCard) {
                  // Check if there's already a last entry display
                  let lastEntryDiv = wellnessCard.querySelector('.last-entry');
                  if (!lastEntryDiv) {
                      // Create last entry div if it doesn't exist
                      lastEntryDiv = document.createElement('div');
                      lastEntryDiv.className = 'last-entry';
                      
                      // Find the check-in button
                      const checkInBtn = wellnessCard.querySelector('.check-in-btn');
                      
                      // Insert the last entry div after the button
                      if (checkInBtn) {
                          checkInBtn.parentNode.insertBefore(lastEntryDiv, checkInBtn.nextSibling);
                      } else {
                          // If button not found, append to card content
                          const cardContent = wellnessCard.querySelector('.card-content');
                          if (cardContent) {
                              cardContent.appendChild(lastEntryDiv);
                          } else {
                              wellnessCard.appendChild(lastEntryDiv);
                          }
                      }
                  }
                  
                  // Format date for display
                  const lastDate = new Date(lastEntry.created_at);
                  
                  // Update the last entry content
                  lastEntryDiv.innerHTML = `
                      <div class="entry-header">
                          <h4>Last Check-in</h4>
                          <button onclick="WellnessTracker.editEntry('${lastEntry.id}')" class="edit-btn">Edit</button>
                      </div>
                      <p>Energy: ${lastEntry.energy_level}/5 • Mood: ${lastEntry.mood}/5 • Cravings: ${lastEntry.caffeine_craving}/5</p>
                      <small>Logged on ${lastDate.toLocaleDateString()} at ${lastDate.toLocaleTimeString()}</small>
                                              ${lastEntry.notes ? `<p class="notes">${lastEntry.notes}</p>` : ''}
                    `;
                }
            }
            
            // Display entries and update chart
            updateWellnessChart(data);
            
            // Add coffee mascot
            this.addCoffeeMascot();
            
        } catch (err) {
            console.error("Error loading wellness data:", err);
        }
    },
    
    // Add coffee mascot to the wellness card
    addCoffeeMascot: function() {
        // Find the wellness check-in card (second feature card)
        const wellnessCard = document.querySelector('.feature-card:nth-child(2)');
        if (!wellnessCard) return;
        
        // Check if mascot already exists
        if (wellnessCard.querySelector('.coffee-mascot')) return;
        
        // Create the mascot element
        const mascot = document.createElement('div');
        mascot.className = 'coffee-mascot';
        mascot.innerHTML = `
            <div class="coffee-emoji" id="coffeeEmoji">☕</div>
            <div class="mascot-message">Click me for wellness tips!</div>
        `;
        
        // Add it to the card (after the last-entry if it exists, or after the check-in button)
        const lastEntry = wellnessCard.querySelector('.last-entry');
        const checkInBtn = wellnessCard.querySelector('.check-in-btn');
        
        if (lastEntry) {
            lastEntry.insertAdjacentElement('afterend', mascot);
        } else if (checkInBtn) {
            checkInBtn.insertAdjacentElement('afterend', mascot);
        } else {
            wellnessCard.appendChild(mascot);
        }
        
        // Add event listener for the wiggle animation and wellness tips
        const emoji = mascot.querySelector('.coffee-emoji');
        const messageEl = mascot.querySelector('.mascot-message');
        
        const wellnessTips = [
            "Take deep breaths to help with caffeine cravings",
            "Stay hydrated - drink water when you crave caffeine",
            "A short walk can boost energy naturally",
            "Herbal teas can be a great caffeine alternative",
            "Try meditation to reduce caffeine withdrawal symptoms",
            "Regular sleep schedules help regulate natural energy",
            "Eat balanced meals to maintain steady energy levels"
        ];
        
        emoji.addEventListener('click', () => {
            // Add wiggle animation
            emoji.classList.remove('wiggle');
            void emoji.offsetWidth; // Trigger reflow
            emoji.classList.add('wiggle');
            
            // Change message
            const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
            messageEl.textContent = randomTip;
        });
    }
};

// Function to update the wellness chart with real data
function updateWellnessChart(wellnessData) {
  // Check if there's any Chart instance on this canvas
  const existingChart = Chart.getChart('statsChart');
  if (existingChart) {
    existingChart.destroy();
  }
  
  // Now also check our stored reference and destroy if exists
  if (window.wellnessChart) {
    window.wellnessChart.destroy();
  }
  
  const ctx = document.getElementById('statsChart').getContext('2d');
  
  // Prepare dates and data points
  const dates = wellnessData.map(entry => {
    const date = new Date(entry.created_at);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
    
  const energyData = wellnessData.map(entry => entry.energy_level);
  const moodData = wellnessData.map(entry => entry.mood);
  const cravingData = wellnessData.map(entry => entry.caffeine_craving);
    
  // If no data, use placeholders
  if (wellnessData.length === 0) {
    // Use sample data
    dates.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
    energyData.push(3, 3, 3, 3, 3, 3, 3);
    moodData.push(3, 3, 3, 3, 3, 3, 3);
    cravingData.push(3, 3, 3, 3, 3, 3, 3);
  }
    
  // Delay chart creation slightly to ensure canvas is ready
  setTimeout(() => {
    try {
      // Create new chart
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
    } catch (error) {
      console.error("Error creating chart:", error);
    }
  }, 50);
}
// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  WellnessTracker.initialize();
});

// Expose the WellnessTracker to the global scope if needed
window.WellnessTracker = WellnessTracker;

