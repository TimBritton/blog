
import { configuration } from '@codedoc/core';

import { theme } from './theme';


export const config = /*#__PURE__*/configuration({
  theme,                                  // --> add the theme. modify `./theme.ts` for chaning the theme.
    dest: {
    namespace: '/blog',
    html: 'dist',
    assets: process.env.GITHUB_BUILD === 'true' ? 'dist' : '.',
    bundle: process.env.GITHUB_BUILD === 'true' ? 'bundle' : 'docs/assets',
    styles: process.env.GITHUB_BUILD === 'true' ? 'styles' : 'docs/assets',
  },
  page: {
    title: {
      base: 'Blog'                        // --> the base title of your doc pages
    }
  },
  
});
