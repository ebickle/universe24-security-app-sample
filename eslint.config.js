import eslintJs from '@eslint/js';
import globals from 'globals';

export default [
    eslintJs.configs.recommended,
    {
        languageOptions: {
            globals: globals.node
        }
    },    
    {
        ignores: [
            ".git/",
            "node_modules/",
            "coverage/"
        ]
    }    
];
