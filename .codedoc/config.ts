
import { configuration } from '@codedoc/core';

import { theme } from './theme';


export const config = /*#__PURE__*/configuration({
  theme,                                  // --> add the theme. modify `./theme.ts` for chaning the theme.
  
  page: {
    title: {
      base: 'Blog'                        // --> the base title of your doc pages
    }
  },
  
});
