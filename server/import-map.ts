export function generateImportMap() {
  return {
    imports: {
      "react": "https://esm.sh/react@19?dev",
      "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime?dev",
      "react/jsx-dev-runtime": "https://esm.sh/react@19/jsx-dev-runtime?dev",
      "react-dom": "https://esm.sh/react-dom@19?dev",
      "react-dom/client": "https://esm.sh/react-dom@19/client?dev",
    },
  };
}
