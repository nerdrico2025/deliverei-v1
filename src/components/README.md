# Components Directory Structure

## 📁 Organization

### `/auth`
Authentication-related components
- `RequireAuth.tsx` - Route protection wrapper

### `/commerce`
E-commerce/storefront components
- `CartDrawer.tsx` - Shopping cart drawer (legacy)
- `CartDrawerBackend.tsx` - Shopping cart with backend integration
- `ProductCard.tsx` - Product display card
- `UpsellStrip.tsx` - Upsell product strip

### `/common`
Reusable base components (design system)
- `Badge.tsx` - Status/label badges
- `Button.tsx` - Button with variants (primary, secondary, ghost, danger)
- `Card.tsx` - Container card
- `Container.tsx` - Layout container with max-width control
- `Input.tsx` - Form input field
- `Loading.tsx` - Loading states (spinner, dots, pulse)
- `types.ts` - Shared TypeScript interfaces

### `/dashboard`
Dashboard-specific components
- `DateRangeFilter.tsx` - Date range picker for analytics
- `SalesChart.tsx` - Sales data visualization chart

### `/layout`
Layout and navigation components
- `DashboardShell.tsx` - Dashboard layout wrapper
- `PublicHeader.tsx` - Public pages header
- `StoreSidebar.tsx` - Store admin sidebar
- `StoreTopbarActions.tsx` - Store topbar action buttons
- `StorefrontHeader.tsx` - Storefront customer header
- `SuperAdminSidebar.tsx` - Super admin sidebar
- `Topbar.tsx` - Generic topbar component

### `/system`
System-level components
- `ImpersonationBanner.tsx` - Admin impersonation indicator

## 🎨 Using Components

All components can be imported via index files:

```tsx
// From specific category
import { Button, Loading, Card } from '../../components/common';

// From root (all components)
import { Button, CartDrawer, DateRangeFilter } from '../../components';
```

## 📝 Component Props

See `common/types.ts` for shared TypeScript interfaces and prop types.

## 🔧 Adding New Components

1. Create component in appropriate category folder
2. Add export to category's `index.ts`
3. Document in this README
4. Use TypeScript interfaces from `common/types.ts` when applicable
