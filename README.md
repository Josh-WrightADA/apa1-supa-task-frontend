# Going Cold Coffee - Caffeine Tracking Application

## Project Overview
Going Cold Coffee is a web application designed to help users track their caffeine consumption and monitor how it affects their overall wellness. The application provides a user-friendly interface for logging caffeine intake, recording wellness metrics, and visualizing the relationship between caffeine consumption and wellbeing over time.

![Application Screenshot](public/appScreenshot.png)

## Features


### Integration
The frontend communicates with the backend through:
1. Direct Supabase client connections (authentication, simple data operations)
2. Express.js proxy server for Edge Function API calls

### User Authentication
- Secure user registration and login using Supabase authentication
- Email/password authentication
- Session management and persistence

### Caffeine Tracking
- Log caffeine consumption with details including:
  - Beverage type (coffee, espresso, tea, energy drink, soda, etc.)
  - Caffeine amount in milligrams
  - Consumption time and date
- View history of caffeine consumption
- Calculate and display time elapsed since last caffeine intake
- Edit and delete past entries
- **Search entries** by beverage type or caffeine amount
- **Sort entries** by date, caffeine amount, or beverage type


### Wellness Check-ins
- Record daily wellness metrics:
  - Energy level (1-5 scale)
  - Mood (1-5 scale)
  - Caffeine cravings (1-5 scale)
  - Optional notes
- Track patterns in wellness metrics over time

### Data Visualization
- Interactive charts showing the relationship between:
  - Caffeine consumption
  - Energy levels
  - Mood
  - Cravings
- Visualize trends over time to identify patterns

### User Interface
- Clean, responsive design
- Intuitive form controls
- Real-time feedback through toast notifications
- Interactive visual elements

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication & Database**: Supabase
- **Visualization**: Chart.js
- **Server**: Node.js with Express


## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/Josh-WrightADA/apa1-supa-task-frontend.git
   cd apa1-supa-task-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

4. Start the application:
   ```
   node server.js
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
public/
├── js/
│   ├── caffeine.js     # Caffeine tracking functionality
│   ├── chart.js        # Chart initialization and management
│   ├── client.js       # Supabase client setup and auth
│   └── wellness.js     # Wellness tracking functionality
├── styles/
│   ├── components/
│   │   ├── buttons.css  # Button styling
│   │   ├── cards.css    # Card component styling
│   │   ├── charts.css   # Chart visualizations styling
│   │   ├── forms.css    # Form elements styling
│   │   ├── modals.css   # Modal dialog styling
│   │   ├── navbar.css   # Navigation bar styling
│   │   └── toasts.css   # Toast notifications styling
│   ├── base/
│   │   ├── base.css     # Base styling and resets
│   │   ├── layout.css   # Layout structures
│   │   └── utilities.css # Utility classes
│   └── main.css         # Main CSS file importing all modules
├── index.html          # Main application page
└── navbar.html         # Navigation component
server.js               # Express server for static files and API proxying
```



## Future Enhancements

- Advanced filtering and sorting of caffeine entries
- Expanded wellness metrics tracking
- Personalized insights and recommendations
- Mobile application version
- Account management


## Testing

The application has been tested using multiple approaches:
- Manual testing for user flows and UI interactions
- Unit tests with Jest for core functionality

### Running Unit Tests

1. Install test dependencies:
   ```
   npm install --save-dev jest jest-environment-jsdom
   ```

2. Run all tests:
   ```
   npm test
   ```

3. Run specific test files:
   ```
   npx jest public/Testing/auth.test.js --config jest.config.js
   npx jest public/Testing/caffeine.test.js --config jest.config.js
   npx jest public/Testing/wellness.test.js --config jest.config.js
   npx jest public/Testing/utils.test.js --config jest.config.js
   ```

### Unit Test Coverage

The Jest tests cover key functionality of the application:

1. **Authentication Module**:
   - User registration functionality
   - Login processes
   - Error handling for authentication

2. **Caffeine Tracking**:
   - Time calculations for caffeine consumption
   - Form submission for caffeine entries
   - UI updates based on caffeine data

3. **Wellness Tracking**:
   - Wellness data visualization with Chart.js
   - Form submission for wellness check-ins
   - Data processing for wellness metrics

4. **Utilities**:
   - Toast notification system
   - UI interaction effects

Each test file validates the component's behavior in isolation, using mocks for external dependencies to ensure reliable testing.


[Link to testing documentation](public/Testing/TESTING.md)
```


## Frontend Components

### 1. Landing Page
- Welcome message for unauthenticated users
- Login and registration buttons
- Brief explanation of the app's purpose

### 2. Dashboard
- Three main feature cards:
  - Caffeine Timer (time since last consumption)
  - Wellness Check-in (log wellness metrics)
  - Insights (data visualization via Chart.js)

### 3. Caffeine Tracking
- Log new caffeine entries (beverage type, amount, time)
- View time since last caffeine
- Edit/delete existing entries

### 4. Wellness Check-in
- Record energy levels, mood, and caffeine cravings (scale 1-5)
- Add optional notes
- Edit/delete previous check-ins

### 5. Data Visualization
- Line chart showing trends over time
- Three metrics tracked: energy level, mood, caffeine cravings
- Data from the last 7 days visible on the chart

## User Guide

### Tracking Caffeine Consumption
1. Click the "Log Caffeine" button
2. Select beverage type (coffee, tea, etc.)
3. Enter caffeine amount in mg
4. Set the consumption time (defaults to current time)
5. Click "Save"

### Recording Wellness Check-ins
1. Click the "Log Status" button
2. Rate your energy level (1-5)
3. Rate your mood (1-5)
4. Rate your caffeine craving (1-5)
5. Add optional notes
6. Click "Save"

### Viewing Insights
- The insights chart automatically updates with new data
- Shows data from the last 7 days
- Visualizes the relationship between caffeine habits and wellness metrics

## Development Information

### Code Structure

#### Frontend
- `public/`
  - `index.html` - Main app HTML
  - `client.js` - Authentication and initialization
  - `caffeine.js` - Caffeine tracking functionality
  - `wellness.js` - Wellness check-in functionality
  - `chart.js` - Data visualization
  - `navbar.html` - Navigation component

#### Backend
- `supabase/functions/`
  - `caffeineTimer/` - API for caffeine tracking
  - `wellnessCheckin/` - API for wellness metrics
  - `statsProcessor/` - Data processing for insights

### Security Implementation
- Row-Level Security (RLS) ensures users only access their own data
- JWT authentication for API requests
- Server-side validation for all data inputs


```
