import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.vite'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 사용하지 않는 변수 경고 (에러 대신)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // any 타입 허용 (점진적 타입 적용)
      '@typescript-eslint/no-explicit-any': 'off',
      // 빈 함수 허용
      '@typescript-eslint/no-empty-function': 'off',
      // console 허용
      'no-console': 'off',
    },
  }
);
