# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**notebk** is a minimalist personal journal and financial tracking application built with React, TypeScript, and Vite. It's a single-page application that stores all data locally in the browser's localStorage. The app features a calendar-based daily diary, monthly expense tracking, annual savings tracking, health goal management, and custom table creation.

## Development Commands

### Web Development
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Android Development (Capacitor)
```bash
# Build web app, sync with Android, and open Android Studio
npm run android

# Build and sync only (without opening Android Studio)
npm run android:build

# Sync web assets to Android project (after making changes)
npm run android:sync

# Open Android project in Android Studio
npm run android:open
```

## Architecture Overview

### State Management
The entire application state is managed through a single `AppState` object stored in `utils/storage.ts`. All data persists to localStorage automatically on every state change. The state structure is:

- `expenses`: Monthly expense/income tracking (keyed by `yyyy-MM`)
- `savings`: Annual savings by month (keyed by year, then month name in Spanish)
- `notes`: Daily diary entries (keyed by `yyyy-MM-dd`)
- `monthlyNotes`: Monthly summary notes (keyed by `yyyy-MM`)
- `health`: Annual health goal checklists (keyed by year)
- `customTables`: User-defined custom tables (keyed by year)

### View System
The app uses a view-based navigation system controlled by the `ViewState` type. Key views include:

- `calendar`: Main calendar view showing the current month
- `diary`: Daily note editor for individual dates
- `monthlyNotes`: Monthly summary notes view
- `expenses`: Monthly expense/income table editor
- `summary`: Annual financial summary view (aggregates all monthly expenses)
- `savings`: Annual savings tracker
- `health`: Annual health goal checklist
- `custom`: Custom table manager

Views are rendered conditionally based on `currentView` state in App.tsx:93-183.

### Date Handling
All date operations use `date-fns` with Spanish locale (`es`). Key date formats:
- Daily notes: `yyyy-MM-dd`
- Monthly data: `yyyy-MM`
- Annual data: `yyyy`

The app maintains two date states:
- `viewDate`: Controls which month/year is being viewed
- `selectedDate`: Tracks the currently selected date for diary view

### Component Structure
The application is a single-file React component (`App.tsx`) with inline sub-components:
- `MonthlyNotesView`: Monthly note editor
- `AnnualSummaryView`: Annual financial summary table
- `ExpensesView`: Monthly expense/income table
- `DiaryView`: Daily diary editor with day navigation
- `SavingsView`: Annual savings table
- `HealthView`: Health goal checklist
- `CustomTableView`: Custom table manager
- `EditableTableRows`: Reusable editable table component

Each view component receives data and update callbacks as props, following a unidirectional data flow pattern.

### Styling
The app uses Tailwind CSS via CDN (loaded in `index.html`). The design is minimalist with:
- Black borders and monochromatic color scheme
- Uppercase tracking-widest headings
- Light font weights (300-500)
- Slide-in and fade-in animations for view transitions
- Mobile-first responsive design (max-width: 28rem)

### Path Aliases
The TypeScript config defines `@/*` as an alias to the project root directory. Use this when importing from the root level.

## Key Implementation Patterns

### Adding New Data Types
When adding new data types to the app state:
1. Define the type in `types.ts`
2. Add the field to `AppState` interface
3. Initialize default value in `loadData()` in `utils/storage.ts`
4. Create update handler in `App` component (following pattern like `updateNotes`)
5. Create view component for the new data type
6. Add view case to `renderView()` switch statement

### Date-Based Data
All date-based data uses string keys formatted with `date-fns` format functions. When accessing or storing data, always use the format function to ensure consistency.

### Component Updates
Components trigger updates through callbacks passed from the main App component. All updates flow through `setData()` with immutable state updates using spread operators.

## Capacitor Integration

The application uses Capacitor to create a native Android app from the web application.

### Build Process
1. Vite builds the web app and outputs to `/dist` directory
2. Capacitor copies the web assets from `/dist` to `/android/app/src/main/assets/public`
3. The Android app runs the web application in a WebView
4. localStorage works seamlessly in the WebView, maintaining the same data storage approach

### Configuration
- `capacitor.config.ts` - Main Capacitor configuration file
- `androidScheme: 'https'` - Uses HTTPS scheme for better compatibility with web APIs

### Important Workflow Notes
- Always run `npm run build` before syncing with Android
- After making changes to the web app, run `npm run android:build` or `npm run android:sync` to update the Android project
- The `/android` directory contains the native Android project managed by Capacitor
- Do not manually edit files in `/android/app/src/main/assets/public` - these are auto-generated

### Modifying index.html
The original index.html used import maps with CDN links (esm.sh). This was replaced with a standard Vite setup:
- Removed the `<script type="importmap">` block
- Added `<script type="module" src="/index.tsx"></script>` to enable Vite bundling
- Vite now bundles all dependencies from node_modules into a single JavaScript file
- This ensures all resources are available offline in the Android app

## Notes

- The app has no backend - all data is stored in browser localStorage under the key `notebk_data`
- The Vite config includes environment variable setup for `GEMINI_API_KEY`, but this appears to be unused in the current implementation (likely leftover from the AI Studio template)
- The application is built for mobile-first with viewport restrictions preventing zoom (`user-scalable=no`)
- All views except the annual views (`summary`, `savings`, `health`, `custom`) return to the calendar on back navigation
- Annual views include a bottom navigation bar for switching between annual features
- localStorage data is preserved between app updates when installed via APK
