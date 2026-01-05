## Packages
framer-motion | Essential for the snappy, dramatic Persona 5 style animations and transitions
react-icons | For the Discord and YouTube icons in the footer
clsx | For conditional class names
tailwind-merge | For merging tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Anton'", "sans-serif"],
  body: ["'Roboto Condensed'", "sans-serif"],
}
Replit Auth is handling the login session.
The frontend will communicate with:
- /api/products (GET, POST)
- /api/orders (GET, POST)
- /api/user (GET)
- /api/stats/robux (GET)
