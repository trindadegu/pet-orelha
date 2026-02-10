## Packages
(none needed)

## Notes
- Using framer-motion for page transitions and micro-interactions (already installed)
- Auth implementation uses custom useAuth hook connecting to /api/auth endpoints
- Cart state persisted in localStorage via useCart hook
- Admin routes protected by checking user.role === 'admin'
