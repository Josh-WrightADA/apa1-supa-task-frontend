// Define the utility functions directly in the test file
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
  
  return toast; // Return for testing purposes
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
  
  return ripple; // Return for testing purposes
}

describe('Utility Functions', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore setTimeout
    jest.useRealTimers();
  });
  
  test('showToast creates and shows a toast notification', () => {
    // Call the function
    const toast = showToast('Test message', 'success');
    
    // Check toast was created with correct content
    expect(toast).not.toBeNull();
    expect(toast.textContent).toContain('Test message');
    expect(toast.classList.contains('toast-success')).toBe(true);
    
    // Check toast is shown after small delay
    jest.advanceTimersByTime(100);
    expect(toast.classList.contains('show')).toBe(true);
    
    // Check toast is hidden after timeout
    jest.advanceTimersByTime(3000);
    expect(toast.classList.contains('show')).toBe(false);
  });
  
  test('createRipple adds and removes ripple effect', () => {
    // Create a button
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // Mock event
    const mockEvent = {
      currentTarget: button,
      clientX: 50,
      clientY: 50
    };
    
    // Mock getBoundingClientRect
    button.getBoundingClientRect = jest.fn().mockReturnValue({
      left: 0,
      top: 0
    });
    
    // Call the function
    const ripple = createRipple(mockEvent);
    
    // Check ripple was created with correct position
    expect(ripple).not.toBeNull();
    expect(ripple.style.left).toBe('50px');
    expect(ripple.style.top).toBe('50px');
    
    // Check ripple is removed after animation
    jest.advanceTimersByTime(1000);
    expect(button.contains(ripple)).toBe(false);
  });
});