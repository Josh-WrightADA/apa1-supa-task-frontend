// Global variable to track chart instance
let currentChart = null;

// Function to clean up any existing charts
function cleanupCharts() {
    if (currentChart) {
        console.log("Destroying existing chart");
        currentChart.destroy();
        currentChart = null;
    }
    
    // Also check for wellness chart instance
    if (window.wellnessChart) {
        console.log("Destroying wellness chart");
        window.wellnessChart.destroy();
        window.wellnessChart = null;
    }
    
    // 
    try {
        const existingChart = Chart.getChart('statsChart');
        if (existingChart) {
            console.log("Destroying chart by canvas ID");
            existingChart.destroy();
        }
    } catch (e) {
        
        console.log("Could not get chart by canvas ID (might be ok)");
    }
}

function initializeCharts() {
    console.log("Initializing charts...");
    const chartCanvas = document.getElementById('statsChart');
    
    if (!chartCanvas) {
        console.error("Stats chart canvas not found");
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded");
        return;
    }
    
    // Clean up any existing charts
    cleanupCharts();
    
    const ctx = chartCanvas.getContext('2d');
    
    // Create new chart and store reference
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Energy Level',
                    data: [4, 3, 2, 2, 3, 4, 3],
                    borderColor: '#8b5e3c',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Mood',
                    data: [5, 4, 2, 3, 4, 4, 3],
                    borderColor: '#6d4c41',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Caffeine Cravings',
                    data: [1, 2, 4, 3, 2, 1, 2],
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
    
    console.log("Chart initialized");
}

// Make these functions available globally
window.initializeCharts = initializeCharts;
window.cleanupCharts = cleanupCharts;