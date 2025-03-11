# Testing Documentation

This document outlines the testing approach and results for the Going Cold Coffee application.

## Testing Approach

The application was tested using a combination of:
- Manual testing of user flows
- Input validation testing
- Cross-browser compatibility testing
- Error handling testing
- User testing from peers

## Manual Test Cases

### User Authentication

| Test ID | Description | Steps | Expected Result | Status | Screenshot |
|---------|-------------|-------|----------------|--------|------------|
| AUTH-01 | User Registration | 1. Click "Register" button<br>2. Enter email<br>3. Enter password<br>4. Confirm password<br>5. Click "Create Account" | User account is created and notification appears | ✅ Pass | [Screenshot](screenshots/register.png) |
| AUTH-02 | User Login | 1. Click "Sign In" button<br>2. Enter registered email<br>3. Enter password<br>4. Click "Submit" | User is logged in and dashboard appears | ✅ Pass | [Screenshot](screenshots/loggedIn.png) |
| AUTH-03 | User Logout | 1. Click "Sign Out" button | User is logged out and welcome screen appears | ✅ Pass | [Screenshot](screenshots/logOut.png) |
| AUTH-04 | Password Mismatch | 1. Click "Register"<br>2. Enter email<br>3. Enter password<br>4. Enter different confirm password<br>5. Submit | Error message displayed about password mismatch | ✅ Pass | [Screenshot](screenshots/passwordMismatch.png) |

### Caffeine Tracking

| Test ID | Description | Steps | Expected Result | Status | Screenshot |
|---------|-------------|-------|----------------|--------|------------|
| CAFF-01 | Add Caffeine Entry | 1. Click "Log Caffeine" button<br>2. Select beverage type<br>3. Enter amount<br>4. Select time<br>5. Click "Save" | Entry is saved and appears in timer display | ✅ Pass | [Screenshot](screenshots/caffeineEntry.png) |
| CAFF-02 | Edit Caffeine Entry | 1. Locate existing entry<br>2. Click edit button<br>3. Modify details<br>4. Click "Update" | Entry is updated with new information | ✅ Pass | [Screenshot](screenshots/editEntry.png) |
| CAFF-03 | Delete Caffeine Entry | 1. Locate existing entry<br>2. Click edit button<br>3. Click "Delete Entry"<br>4. Confirm deletion | Entry is removed from the list | ✅ Pass | [Screenshot](screenshots/deleteEntry.png) |
| CAFF-04 | Future Date Validation | 1. Click "Log Caffeine"<br>2. Enter valid details<br>3. Set future date/time<br>4. Click "Save" | Error message about future dates not allowed | ✅ Pass | [Screenshot](screenshots/futureValidation.png) |

### Wellness Check-ins

| Test ID | Description | Steps | Expected Result | Status | Screenshot |
|---------|-------------|-------|----------------|--------|------------|
| WELL-01 | Add Wellness Check-in | 1. Click "Log Status" button<br>2. Set energy level<br>3. Set mood level<br>4. Set craving level<br>5. Add notes<br>6. Click "Save" | Check-in is saved and chart updates | ✅ Pass | [Screenshot](screenshots/wellnessEntry.png) |
| WELL-02 | View Wellness Trends | 1. Log multiple wellness check-ins<br>2. View the Insights card | Chart displays with correct data points | ✅ Pass | [Screenshot](screenshots/insights.png) |

### Form Validation

| Test ID | Description | Steps | Expected Result | Status | Screenshot |
|---------|-------------|-------|----------------|--------|------------|
| FORM-01 | Empty Form Submission | 1. Open any form<br>2. Leave fields empty<br>3. Submit form | Form shows validation errors | ✅ Pass | [Screenshot](screenshots/emptyForm.png) |
| FORM-02 | Invalid Email Format | 1. Open login form<br>2. Enter invalid email format<br>3. Submit | Validation error for email format | ✅ Pass | [Screenshot](screenshots/invalidEmail.png) |
| FORM-03 | Caffeine Amount Bounds | 1. Open caffeine form<br>2. Enter negative amount<br>3. Submit | Validation error for invalid amount | ✅ Pass | [Screenshot](screenshots/invalidAmount.png) |

### Error Handling

| Test ID | Description | Steps | Expected Result | Status | Screenshot |
|---------|-------------|-------|----------------|--------|------------|

| ERR-01 | Authentication Error | 1. Enter incorrect login credentials<br>2. Submit login form | Appropriate error message shown | ✅ Pass | [Screenshot](screenshots/incorrectLogin.png) |

## Cross-Browser Testing

| Browser | Version | Compatibility | Notes |
|---------|---------|---------------|-------|
| Chrome | 91+ | ✅ Full | All features work as expected |
| Firefox | 89+ | ✅ Full | All features work as expected |
| Safari | 14+ | ✅ Full | Minor styling differences but functionality intact |

## Edge Cases Tested

1. **Large Data Sets**: Tested with 50+ caffeine entries to ensure performance and UI handling
2. **Long Text in Notes**: Tested with very long text entries in wellness notes field
3. **Multiple Devices**: Tested login from multiple devices with the same account
4. **Browser Refresh**: Tested application behavior after browser refresh at different points
5. **Session Timeout**: Tested behavior when authentication session expires

## Known Limitations

1. Offline functionality is not supported - requires internet connection
2. Chart visualization has limited customization options
3. No export functionality for historical data


