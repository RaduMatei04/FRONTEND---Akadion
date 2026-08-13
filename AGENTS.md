# AGENTS.md

## Project Context

This project is currently undergoing a controlled modernization and migration process.

The existing codebase must be improved incrementally. Do not perform large-scale rewrites or introduce architectural changes unless they are explicitly required by the current task.

The main migration goals are:

1. Add and progressively adopt TypeScript.
2. Migrate data fetching and server-state management from Axios to TanStack Query.
3. Migrate forms implemented with base React state/handlers to TanStack Form + Zod.
4. Improve overall code quality and enforce clean-code principles.
5. Reduce duplication and enforce DRY.
6. Establish and maintain a consistent feature-based directory structure.

When modifying existing code, prefer incremental migration over rewriting unrelated parts of the application.

---

# Target Final Stack

The final target stack for the project is:

* React
* React DOM
* React Router DOM
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* TanStack Form
* Zod

New code should follow this target stack.

Do not introduce alternative libraries or architectural patterns that conflict with the target stack unless explicitly required by the user.

---

# Core Development Principles

## Clean Code

All new code and all code touched during migration must follow clean-code principles.

### General Rules

* Code must be easy to read and understand without unnecessary mental overhead.
* Prefer simple solutions over clever abstractions.
* Keep functions small and focused on one responsibility.
* Keep components focused on one responsibility.
* Avoid deeply nested conditional logic.
* Prefer early returns over unnecessary nesting.
* Use descriptive names for variables, functions, hooks, components, and types.
* Avoid abbreviations unless they are universally understood within the project.
* Avoid boolean variables with ambiguous names.
* Avoid magic numbers and magic strings.
* Extract repeated or meaningful constants into named constants.
* Avoid unnecessary comments. Code should explain itself through naming and structure.
* Comments should explain **why**, not simply restate **what** the code does.
* Remove dead code when touching an area.
* Do not leave unused imports, variables, functions, types, or dependencies.
* Avoid premature abstractions.
* Do not create abstractions only because two pieces of code look superficially similar.
* Prefer composition over inheritance.
* Keep side effects explicit and isolated.

---

# DRY — Strictly Enforced

DRY (Don't Repeat Yourself) is mandatory.

Repeated logic must not be copied across components, hooks, pages, or features when the logic represents the same responsibility.

Before adding new logic, check whether an existing:

* component
* hook
* utility
* type
* validation schema
* query
* mutation
* constant
* helper

already provides the required behavior.

If the same business or technical logic appears in multiple places, extract it into an appropriate shared abstraction.

However, do not create generic abstractions merely to eliminate superficial duplication.

The abstraction must represent a meaningful shared concept.

### Important

Do not solve duplication by creating massive "utils" files or generic helpers with unclear ownership.

Place shared code at the narrowest appropriate scope:

* application-wide reusable code → `/components`, `/hooks`, `/utils`, etc.
* feature-specific code → inside the relevant feature directory
* component-specific code → next to the component that owns it

---

# Directory Structure

The directory structure is mandatory.

The goal is to keep reusable UI separate from feature/context-specific code.

## Global `/components`

`/components/` contains reusable UI components that are **agnostic of application context**.

Examples:

* Button
* Modal
* Input
* Select
* Table
* Card
* Dropdown
* Form primitives
* Generic layout components

A component must not be placed in `/components` if it contains business logic specific to a route or feature.

For example:

```text
/components/ProductTable
```

is incorrect if the component knows about products, product APIs, product statuses, or product-specific business rules.

A generic table belongs in:

```text
/components/Table
```

while product-specific composition belongs inside the product feature.

---

# Feature / Route Structure

Each route or feature must own its context-specific components, hooks, and complex sections.

Example:

```text
/product
├── ProductList.tsx
├── components/
│   ├── ProductRow.tsx
│   ├── ProductFilters.tsx
│   ├── ProductActions.tsx
│   └── ProductEmptyState.tsx
├── hooks/
│   ├── useProductFilters.ts
│   └── useProductSelection.ts
├── section1/
│   ├── Section1.tsx
│   └── components/
├── section2/
│   ├── Section2.tsx
│   └── components/
└── section3/
    ├── Section3.tsx
    └── components/
```

## Feature Rules

The feature's main component should remain readable and primarily orchestrate the feature.

For example:

```text
/product/ProductList.tsx
```

should compose:

```text
/components/
```

global reusable components,

and:

```text
/product/components/
```

product-specific components.

Custom hooks used specifically by `ProductList` belong in:

```text
/product/hooks/
```

If a feature contains multiple complex sections, each section should have its own directory:

```text
/product/section1/
/product/section2/
/product/section3/
```

Do not place every component in a single flat `components/` directory when the feature has clearly identifiable complex sections.

---

# Component Ownership

When creating a component, determine its scope before creating the file.

Use this hierarchy:

### 1. Application-wide / context-agnostic

```text
/components/
```

### 2. Feature-specific

```text
/<feature>/components/
```

### 3. Section-specific

```text
/<feature>/<section>/components/
```

### 4. Component-specific

If a component has private implementation details that are not useful elsewhere, keep them close to the owning component.

Do not promote code to a global directory without a real reuse requirement.

---

# TypeScript Migration

TypeScript is being introduced incrementally.

The migration must be progressive and safe.

## Rules

* All newly created source files should use TypeScript.
* Prefer `.ts` and `.tsx` for new code.
* Do not introduce new JavaScript files unless there is a specific technical reason.
* When modifying an existing JavaScript file, migrate it to TypeScript when reasonably safe and within the scope of the task.
* Do not perform unrelated mass migrations just to convert files to TypeScript.
* Avoid `any`.
* `any` should only be used as an explicit temporary migration escape hatch when there is no reasonable alternative.
* Prefer explicit types at API boundaries and important domain boundaries.
* Let TypeScript infer obvious local types.
* Avoid unnecessary type annotations.
* Prefer `type` or `interface` according to the project's established convention.
* Keep domain types close to the domain they describe unless they are genuinely shared.
* Do not duplicate equivalent types in multiple features.

### Migration Principle

The objective is:

```text
JavaScript → TypeScript
```

incrementally, not through a single risky rewrite.

Every touched area should move the project toward stronger typing.

---

# Axios → TanStack Query Migration

The project is being migrated from Axios-based data fetching toward TanStack Query.

## Target Architecture

Server state should be managed through TanStack Query.

Use TanStack Query for:

* queries
* mutations
* caching
* loading states
* error states
* refetching
* invalidation
* synchronization of server state

Avoid manually managing server state with:

```text
useEffect
useState
```

when the state represents data fetched from the server.

## Migration Rules

When working on an existing Axios-based feature:

* Do not rewrite unrelated API calls.
* If the current task touches data fetching, prefer migrating that flow to TanStack Query.
* New server-state flows should use TanStack Query.
* Do not introduce new patterns based on manual `useEffect` + Axios fetching when TanStack Query is appropriate.
* Keep query and mutation logic organized and reusable.
* Use stable and meaningful query keys.
* Centralize query-related logic when it is reused by multiple components.
* Avoid duplicating query configuration across components.

### Important

Axios should not be replaced blindly with TanStack Query.

TanStack Query is responsible for **server-state management**. It is not simply an Axios replacement.

The migration should separate:

```text
API communication
        ↓
TanStack Query
        ↓
Feature / component
```

rather than putting HTTP logic directly into UI components.

---

# Forms Migration

Existing forms implemented primarily with base React state and event handlers are being migrated to:

```text
TanStack Form + Zod
```

## Target Architecture

Use TanStack Form for form state and form lifecycle.

Use Zod for:

* validation
* schema definition
* parsing
* validation messages
* domain/input constraints where appropriate

The preferred conceptual structure is:

```text
Form
 ├── TanStack Form
 ├── Zod schema
 ├── fields
 └── submit handler
```

## Rules

New complex forms should use TanStack Form + Zod.

When modifying an existing form:

* Prefer migrating it to TanStack Form + Zod when the task is related to that form.
* Do not introduce additional custom form-state patterns.
* Avoid large collections of independent `useState` values for form fields.
* Avoid duplicating validation logic between UI and submit handlers.
* Keep validation rules in Zod schemas where appropriate.
* Do not duplicate the same validation rules across multiple components.

Simple UI state that is not actually form state may continue to use React state.

For example, modal visibility, UI toggles, temporary display state, etc. do not automatically require TanStack Form.

---

# Migration Strategy

The project must be migrated incrementally.

The migration priority is:

```text
1. TypeScript
      ↓
2. TanStack Query
      ↓
3. TanStack Form + Zod
      ↓
4. Continuous cleanup and architectural improvements
```

These migrations can overlap when touching the same feature, but do not create unnecessary cross-feature rewrites.

## Rule: Leave the Codebase Better

Every change should, when reasonably possible:

* improve typing
* reduce duplication
* simplify component logic
* improve directory ownership
* remove obsolete patterns
* move the feature closer to the target architecture

Do not introduce new technical debt merely to finish a task faster.

At the same time, avoid expanding the scope of a task into a complete rewrite.

---

# React Rules

* Prefer functional components.
* Keep components focused.
* Avoid components with excessive responsibilities.
* Move reusable behavior into hooks.
* Do not create hooks solely to wrap a single trivial expression.
* Avoid unnecessary `useEffect`.
* Do not use `useEffect` as a substitute for derived state.
* Prefer derived values over synchronized state.
* Keep side effects isolated.
* Avoid prop drilling when a more appropriate composition pattern exists.
* Do not introduce global state for state that can remain local to a feature.

---

# Hooks

Hooks should encapsulate reusable behavior, not arbitrary component code.

A custom hook should have a clear responsibility.

Good:

```text
useProductFilters
useProductSelection
useProductQuery
useCreateProduct
```

Avoid vague hooks such as:

```text
useHelpers
useCommon
useStuff
useData
```

Feature-specific hooks belong to the feature:

```text
/product/hooks/
```

Truly shared hooks may live in the shared/global hooks location.

---

# API and Server State

UI components should not contain duplicated API communication logic.

Avoid:

```text
Component
 ├── fetch
 ├── loading state
 ├── error state
 ├── retry logic
 └── data transformation
```

Prefer:

```text
API / Query layer
        ↓
TanStack Query
        ↓
Feature
        ↓
UI
```

Keep data fetching concerns separate from presentation whenever practical.

---

# Error Handling

Errors must be handled intentionally.

Do not silently swallow errors.

Avoid:

```ts
try {
  ...
} catch {
}
```

unless intentionally justified.

User-facing errors should be presented at the appropriate UI boundary.

Technical errors should retain enough context to diagnose the problem.

Do not duplicate identical error-handling logic across multiple components.

---

# Naming

Names should describe intent.

Prefer:

```text
ProductList
ProductFilters
useProductFilters
createProduct
productSchema
```

Avoid:

```text
Data
Helper
Stuff
Thing
Temp
handleData
processData
commonFunction
```

Boolean names should clearly communicate their meaning:

```text
isLoading
isOpen
hasProducts
canEdit
```

---

# Component Size

Large components should be split when they have multiple independent responsibilities.

Before extracting a component, identify its actual responsibility.

Do not blindly split every JSX fragment into a component.

A component extraction should improve:

* readability
* ownership
* reuse
* testability
* separation of responsibilities

---

# No Premature Abstraction

Do not create abstractions before there is a meaningful need.

Avoid generic components/hooks/utilities such as:

```text
GenericDataManager
UniversalForm
CommonHandler
BaseFeature
useGenericThing
```

unless there is a clearly established shared responsibility.

Prefer explicit feature code until a reusable abstraction is justified.

---

# Dependency Rules

Do not introduce a new dependency for a problem that can reasonably be solved with:

* existing project dependencies
* native browser APIs
* React
* TypeScript
* existing internal utilities

Before introducing a dependency, verify that it provides meaningful value and fits the target architecture.

---

# Existing Code

Existing code may not comply with all of these rules.

That is expected during the migration.

Do not attempt to fix the entire codebase when working on an unrelated task.

Instead:

1. Follow these rules for all new code.
2. Improve code that is directly touched by the task.
3. Migrate outdated patterns when doing so is reasonably scoped.
4. Avoid unrelated rewrites.
5. Preserve existing behavior unless the task explicitly requires behavioral changes.

---

# Development Server

The development server is **always running**.

## Mandatory Rule

**Never start the development server.**

Do not execute commands such as:

```text
npm run dev
npm start
yarn dev
pnpm dev
vite
next dev
```

unless explicitly instructed by the user.

The dev server is assumed to already be running.

## Never Stop the Development Server

Do not:

* kill the dev server
* restart the dev server
* terminate its process
* start a second dev server

unless explicitly instructed by the user.

If a running development server is required for testing, assume it is already available.

---

# Validation

Before considering a change complete:

1. Verify TypeScript types where applicable.
2. Run the project's existing linting checks when available.
3. Run relevant tests when available.
4. Verify that the modified feature still behaves correctly.
5. Check for unused imports and dead code.
6. Check that no unnecessary duplication was introduced.
7. Check that files are located in the correct directory according to the feature structure.
8. Check that no new Axios-based server-state pattern was introduced where TanStack Query should be used.
9. Check that new forms follow TanStack Form + Zod when applicable.
10. Never start or restart the development server as part of validation.

---

# Agent Behavior

When implementing a task, the agent should first understand:

1. The existing architecture.
2. The feature/route being modified.
3. Existing reusable components.
4. Existing hooks and utilities.
5. Existing API/query patterns.
6. Whether the feature is already partially migrated.
7. Whether the requested change should advance one of the migrations.

Before creating a new component, hook, utility, type, query, or validation schema, search for an existing equivalent.

Prefer extending an existing abstraction over creating a duplicate.

When uncertain between two architectural approaches, prefer the one that:

* introduces less duplication
* has clearer ownership
* follows the target migration architecture
* has the smallest reasonable scope
* leaves the codebase easier to migrate further

---

# Definition of Done

A change is considered complete when:

* The requested functionality works.
* Existing behavior is preserved unless intentionally changed.
* New code follows the clean-code rules.
* DRY is respected.
* Files follow the mandatory directory structure.
* New code uses TypeScript.
* Server state uses TanStack Query where applicable.
* Forms use TanStack Form + Zod where applicable.
* No unnecessary Axios usage is introduced.
* No unnecessary React form-state patterns are introduced.
* No unrelated rewrite was performed.
* No development server was started, stopped, or restarted.
* The resulting code moves the project toward the target architecture.


secretul este : girafa 