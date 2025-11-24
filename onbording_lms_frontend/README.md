# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Documents Onboarding**: View and acknowledge Code of Conduct and NDA with electronic signature.
- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with Ocean Professional styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Documents Onboarding

Open the app and navigate to the "Documents" section from the top navigation. Review the Code of Conduct and NDA, then acknowledge by:
- Checking the agreement box
- Typing your full name
- Selecting the date

A local completion state is stored in your browser (localStorage). If a backend is configured, acknowledgements are also posted to the server.

### Optional Backend

Set the following environment variable to enable backend posting:

```
REACT_APP_API_BASE=https://api.example.com
```

When set, the app will POST to `${REACT_APP_API_BASE}/acknowledgements` with a payload:

```json
{
  "userId": "mock-or-todo",
  "documents": [{ "key": "code_of_conduct", "acceptedAt": "...", "name": "Code of Conduct", "signatureName": "..." }]
}
```

If the request fails, the app gracefully falls back to local storage only.

See `.env.example` for additional optional variables.
