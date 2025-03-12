function signUp(email, password) {
  return global.supabaseClient.auth.signUp({
    email,
    password,
  }).then(({ data, error }) => {
    if (error) {
      global.showToast(error.message, 'error');
    } else {
      global.showToast("Sign-up successful! Check your email to confirm.", 'success');
      document.getElementById('registerModal').style.display = 'none';
    }
    return { data, error };
  });
}

function signIn(email, password) {
  return global.supabaseClient.auth.signInWithPassword({
    email,
    password,
  }).then(({ data, error }) => {
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        global.showToast("Account not found. Please register.", 'error');
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'block';
      } else {
        global.showToast(error.message, 'error');
      }
    } else {
      document.getElementById('authModal').style.display = 'none';
      global.showToast("Welcome back! ☕", 'success');
    }
    return { data, error };
  });
}

// Mock the global showToast function
global.showToast = jest.fn();

describe('Authentication Functions', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = `
      <div id="authModal" style="display: block;"></div>
      <div id="registerModal" style="display: block;"></div>
    `;
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('signUp shows success message on successful registration', async () => {
    // Mock successful sign up
    global.supabaseClient = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: {}, error: null })
      }
    };
    
    await signUp('test@example.com', 'password123');
    
    // Check that Supabase signUp was called with correct args
    expect(global.supabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Check that success toast was shown
    expect(global.showToast).toHaveBeenCalledWith(
      "Sign-up successful! Check your email to confirm.", 
      'success'
    );
    
    // Check that register modal was hidden
    expect(document.getElementById('registerModal').style.display).toBe('none');
  });
  
  test('signUp shows error message on failed registration', async () => {
    // Mock failed sign up
    const errorMessage = 'Email already registered';
    global.supabaseClient = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: errorMessage } 
        })
      }
    };
    
    await signUp('test@example.com', 'password123');
    
    // Check that error toast was shown
    expect(global.showToast).toHaveBeenCalledWith(errorMessage, 'error');
    
    // Check that register modal was not hidden
    expect(document.getElementById('registerModal').style.display).not.toBe('none');
  });

  test('signIn redirects to register when user not found', async () => {
    // Mock failed sign in with specific error
    global.supabaseClient = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Invalid login credentials' } 
        })
      }
    };
    
    await signIn('test@example.com', 'password123');
    
    // Check that appropriate error toast was shown
    expect(global.showToast).toHaveBeenCalledWith(
      "Account not found. Please register.", 
      'error'
    );
    
    // Check that auth modal was hidden
    expect(document.getElementById('authModal').style.display).toBe('none');
    
    // Check that register modal was shown
    expect(document.getElementById('registerModal').style.display).toBe('block');
  });
});