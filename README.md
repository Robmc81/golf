# Golf Scorecard App

A React Native mobile application for tracking golf scores and managing rounds at Charlie Yates Golf Course.

## Features

### Round Management
- Create new rounds with course and tee box selection
- Track scores for 9-hole rounds
- View round history and statistics
- Mark rounds as active/inactive
- Real-time score updates

### Course Features
- Detailed course information
- Hole-by-hole view with:
  - Distance markers (Front, Middle, Back tees)
  - Par and handicap information
  - Interactive map view
  - 3D green view
  - Wind and slope information

### Scorecard Features
- Real-time score entry
- Multi-player support
- Total score calculation
- Hole-by-hole score tracking
- Round summary with statistics

### User Interface
- Clean, intuitive design
- Tab-based navigation
- Responsive layout
- Loading states and error handling
- Debug mode for development

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Maps**: React Native Maps
- **Styling**: React Native StyleSheet

## Project Structure

```
golfapp/
├── app/
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Courses list
│   │   ├── create.tsx       # New round creation
│   │   └── profile.tsx      # User profile
│   ├── course-details.tsx   # Course information
│   ├── hole-view.tsx        # Individual hole view
│   ├── round-settings.tsx   # Round configuration
│   ├── round-summary.tsx    # Round completion summary
│   ├── scorecard.tsx        # Score tracking
│   └── utils/              # Utility functions
│       └── supabaseClient.ts
├── constants/              # App constants
│   └── colors.ts
└── contexts/              # React contexts
    └── SessionContext.tsx
```

## Database Schema

### charlie_yates_scorecards
- `id`: string (primary key)
- `user_id`: string
- `date_played`: string
- `course`: string
- `tee_box`: string
- `weather_conditions`: string | null
- `playing_partners`: string[] | null
- `total_score`: number | null
- `total_putts`: number | null
- `total_fairways`: number | null
- `total_gir`: number | null
- `status`: 'in_progress' | 'completed'
- `active`: boolean
- `created_at`: string
- `updated_at`: string
- `hole_1_score` through `hole_9_score`: number | null

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with Supabase credentials
4. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Use consistent naming conventions
- Document complex functions

### State Management
- Use React Context for global state
- Implement proper loading states
- Handle error states gracefully

### Navigation
- Use Expo Router for navigation
- Implement proper back navigation
- Handle deep linking

## Contributing

1. Create a new branch for features
2. Follow the code style guidelines
3. Test thoroughly
4. Submit a pull request

## License

This project is proprietary and confidential. 