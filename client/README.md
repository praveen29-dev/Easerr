# Job Board Client

This is the client-side application for the job board platform, built with React and Vite.

## Architecture

- **Frontend**: React 19, React Router v7
- **State Management**: React Query (TanStack Query) for API data fetching and caching
- **Styling**: Tailwind CSS for responsive UI
- **HTTP Client**: Axios for API requests

## Important Notes

- All Firebase functionality is handled exclusively on the server-side
- File uploads (profile images, resumes) are processed through the backend API
- Authentication is managed via JWT tokens, not Firebase Auth
- The client never directly interacts with Firebase services

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Environment Variables

Create a `.env` file with the following:

```
VITE_API_URL=http://localhost:5000/api
```

Replace with your actual API URL in production.
