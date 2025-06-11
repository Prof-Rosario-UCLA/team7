import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    ignores: ["client-build/**", "dist/**", "node_modules/**"],
  },
  { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser },
  rules: {
    'react/prop-types': 'off'
  }
  },
  pluginReact.configs.flat.recommended,
]);
