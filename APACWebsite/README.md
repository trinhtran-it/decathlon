# Next.js Mantine App

This project is a Next.js application integrated with Mantine, a React component library that provides a set of customizable components and hooks for building modern web applications.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nextjs-mantine-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Project Structure

- `src/components/Layout.tsx`: Contains the Layout component for wrapping the main application layout.
- `src/pages/_app.tsx`: Custom App component for initializing pages and applying global styles.
- `src/pages/_document.tsx`: Custom Document component for augmenting the HTML and body tags.
- `src/pages/index.tsx`: Main landing page component for the application.
- `src/styles/globals.css`: Global CSS styles for the application.
- `src/theme/index.ts`: Theme configuration for Mantine.

## Customization

You can customize the Mantine theme by modifying the `src/theme/index.ts` file. This allows you to change the styles and colors of Mantine components to fit your design requirements.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.