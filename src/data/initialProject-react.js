export const initialFiles = {
  "/index.html": {
    code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>codestudio Starter</title>\n  <link rel="stylesheet" href="/src/index.css">\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>',
  },
  "/package.json": {
    code: '{\n  "name": "codestudio-starter",\n  "version": "1.0.0",\n  "private": true,\n  "type": "module",\n  "dependencies": {\n    "react": "^19.1.1",\n    "react-dom": "^19.1.1"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0"\n  },\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  }\n}',
  },
  "/src/main.jsx": {
    code: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);",
  },
  "/src/App.jsx": {
    code: "import React, { useState } from 'react';\nimport '/src/App.css';\n\nfunction App() {\n  const [counter, setCounter] = useState(0);\n\n  const increment = () => setCounter(prev => prev + 1);\n\n  return (\n    <div className=\"App\">\n      <h1>Hello codestudio 👋</h1>\n      <p>Start editing to see live changes 🚀</p>\n      <p>Counter: {counter}</p>\n      <button onClick={increment}>Increase</button>\n    </div>\n  );\n}\n\nexport default App;",
  },
  "/src/App.css": {
    code: "body {\n  font-family: 'Inter', sans-serif;\n  margin: 0;\n  padding: 0;\n  background: linear-gradient(to bottom right, #19191a, #05070a);\n  min-height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.App {\n  background: rgb(12, 10, 10);\n  padding: 2rem 3rem;\n  border-radius: 12px;\n  box-shadow: 0 8px 20px rgba(0,0,0,0.1);\n  text-align: center;\n}\n\nh1 {\n  font-size: 2rem;\n  color: #fff;\n  margin-bottom: 0.5rem;\n}\n\np {\n  font-size: 1.1rem;\n  color: #fff;\n  margin-bottom: 1rem;\n}\n\nbutton {\n  padding: 0.6rem 1.2rem;\n  background-color: #4f46e5;\n  color: rgb(221, 221, 221);\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background-color: #4338ca;\n}",
  },
  "/src/index.css": {
    code: "* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  \n}\n\n",
  },
};
