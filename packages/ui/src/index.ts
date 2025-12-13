/**
 * @leaderboard/ui - Shared UI component library
 *
 * @packageDocumentation
 *
 * A collection of reusable React components for the leaderboard monorepo.
 * Built on Radix UI primitives with Tailwind CSS styling.
 *
 * ## Features
 *
 * - **Avatar**: User avatar with image and fallback support
 * - **Button**: Configurable button with multiple variants
 * - **Checkbox**: Accessible checkbox component
 * - **DropdownMenu**: Dropdown menu with items
 * - **Input**: Styled text input
 * - **Popover**: Click-triggered popover panel
 * - **Tooltip**: Hover-triggered tooltip
 * - **ThemeProvider**: Theme context provider for light/dark mode
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   Avatar, AvatarImage, AvatarFallback,
 *   Button,
 *   Input,
 *   ThemeProvider
 * } from "@leaderboard/ui";
 *
 * function App() {
 *   return (
 *     <ThemeProvider attribute="class" defaultTheme="system">
 *       <Avatar>
 *         <AvatarImage src="/avatar.png" alt="User" />
 *         <AvatarFallback>JD</AvatarFallback>
 *       </Avatar>
 *       <Button variant="default">Click me</Button>
 *       <Input placeholder="Search..." />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @module @leaderboard/ui
 */

// =============================================================================
// Component Exports
// =============================================================================

export * from "./components";

// =============================================================================
// Utility Exports
// =============================================================================

export { cn } from "./lib/utils";
