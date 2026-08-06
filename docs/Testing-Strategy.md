# Testing Strategy

# Testing Overview

Testing is a core part of the Blog Platform. Every major feature includes a defined automated testing strategy and undergoes manual verification until the automated test suite is implemented. This approach helps verify functionality, prevent regressions, and ensure long-term maintainability.

Testing is being introduced incrementally alongside feature development rather than postponed until the end of the project.

---

# Testing Goals

The testing strategy aims to:

- Verify application correctness
- Prevent regressions
- Ensure secure authentication
- Validate permissions
- Protect business rules
- Improve code reliability
- Support future refactoring with confidence

---

# Testing Philosophy

The project follows these principles:

- Test behavior, not implementation.
- Write meaningful and maintainable tests.
- Keep tests isolated.
- Ensure tests are repeatable.
- Automate testing whenever possible.
- Test backend logic independently from the frontend.

---

# Testing Levels

## Unit Tests

Purpose:

Verify individual components in isolation.

Examples:

- Model methods
- Custom managers
- Utility functions
- Validators

---

## Integration Tests

Purpose:

Verify that multiple components work together correctly.

Examples:

- Model ↔ Database interaction
- Authentication flow
- Serializer ↔ Model integration

---

## API Tests

Purpose:

Verify REST API behavior.

Examples:

- Request validation
- Response format
- Status codes
- Authentication requirements
- Error handling

---

## Permission Tests

Purpose:

Verify authorization and ownership rules.

Examples:

- Anonymous user restrictions
- Authenticated user permissions
- Object-level permissions
- Role-based access

---

# Historical Backend Testing Status (Feature 11)

## Implemented

At the Feature 11 milestone, an automated backend test suite had not yet been created.

However, the Authentication, Posts, Categories, Tags, Comments, and Profiles modules had been comprehensively verified through manual API testing during development.

Manual testing at that milestone validated:

- Authentication workflows
- Request validation
- Response formats
- Authorization
- Object-level permissions
- Ownership enforcement
- Soft deletion
- Publishing workflow
- Publication timestamp management
- Backend business rule enforcement
- Category CRUD operations
- Category slug generation
- Duplicate category name validation
- Staff-only category management
- Public category browsing
- Active category filtering
- Tag CRUD operations
- Tag slug generation
- Duplicate tag name validation
- Staff-only tag management
- Public tag browsing
- Active tag filtering
- Post–Category relationship assignment
- Category relationship updates
- Category relationship removal
- Nested category serialization
- Category slug validation
- Active category validation
- Duplicate category assignment prevention
- Query optimization verification
- Post–Tag relationship assignment
- Tag relationship updates
- Tag relationship removal
- Nested tag serialization
- Tag slug validation
- Active tag validation
- Duplicate tag assignment prevention
- Shared taxonomy validation verification
- Public Comment listing
- Authenticated Comment creation
- Anonymous Comment creation denial
- Published-Post validation
- Invalid and unpublished Post handling
- Comment content validation
- Comment ownership enforcement
- Author-only Comment updates
- Author-only Comment soft deletion
- Non-author update and delete denial
- Backend-controlled author assignment
- Backend-controlled Post assignment
- Soft-deleted Comment exclusion
- Comment response field validation
- Comment query optimization verification
- Authenticated Profile retrieval
- Anonymous private Profile access denial
- Authenticated Profile partial updates
- Anonymous Profile update denial
- Public Profile retrieval
- Unknown public Profile handling
- Public/private Profile response separation
- Email privacy enforcement
- Date-of-birth privacy enforcement
- Website URL validation
- Future date-of-birth rejection
- Optional Profile field clearing
- Backend-controlled Profile ownership
- Prevention of Profile ownership reassignment
- Profile IDOR prevention
- Automatic Profile creation for new Users
- Existing User Profile backfill verification
- Duplicate Profile prevention
- User deletion cascading to Profile
- Profile query optimization using `select_related("user")`

At that milestone, automated tests remained planned for incremental introduction in future features.

---

# Backend Automated Testing Plan

## Authentication Module

The broader backend suite remains planned. Its authentication scope follows the current closed-registration contract:

### User Authentication Tests

- Administrator-controlled user provisioning
- Duplicate username validation
- Duplicate email validation
- Password confirmation validation
- Password strength validation
- Application-role allowlist and replacement validation
- Successful login
- Invalid login credentials
- Successful-login `last_login` update
- Protected endpoint authentication
- Missing access token
- Invalid access token
- Current-user identity and managed-role response
- Logout
- Refresh token blacklisting
- Refresh token rotation and blacklist-after-rotation
- Token verification
- Development CORS allowlist and credential-free behavior

## Posts Module

The following automated tests are planned for the Posts application:

### Model Tests

- Slug generation
- Soft delete
- Restore functionality
- Audit field updates

### Serializer Tests

- Create serializer validation
- Update serializer validation
- Required field validation
- Empty title/content validation

### Shared Taxonomy Validation Tests

- Duplicate category slug validation
- Duplicate tag slug validation
- Invalid category validation
- Invalid tag validation
- Inactive category validation
- Inactive tag validation
- Relationship synchronization behavior

### API Tests

- Create post
- List published posts
- Retrieve post by slug
- Update own post
- Delete own post
- Publish draft post
- Unpublish published post
- Reject invalid publishing transitions
- Verify publication timestamps
- Create post with categories
- Create post without categories
- Update categories
- Clear categories
- Replace categories
- Verify nested category responses
- Reject invalid category slugs
- Reject inactive categories
- Reject duplicate category assignments
- Create post with tags
- Create post without tags
- Update tags
- Clear tags
- Replace tags
- Verify nested tag responses
- Reject invalid tag slugs
- Reject inactive tags
- Reject duplicate tag assignments
- Verify taxonomy mixin validation behavior

### Permission Tests

- Anonymous read access
- Authenticated create access
- Author update access
- Non-author update denial
- Author delete access
- Non-author delete denial
- Author publish access
- Non-author publish denial
- Author unpublish access
- Non-author unpublish denial
- Author category assignment access
- Non-author category update denial
- Ownership enforcement during category updates
- Author tag assignment access
- Non-author tag update denial
- Ownership enforcement during tag updates

## Categories Module

The following automated tests are planned for the Categories application:

### Model Tests

- Category creation
- Unique slug generation
- Active status manager
- Audit field updates

### Serializer Tests

- Create serializer validation
- Update serializer validation
- Duplicate category name validation
- Blank category name validation
- Category slug validation
- Duplicate category slug validation
- Active category validation
- Category relationship synchronization

### API Tests

- Create category
- List active categories
- Retrieve category by slug
- Update category
- Reject duplicate category names
- Verify automatic slug generation

### Permission Tests

- Anonymous list access
- Anonymous retrieve access
- Editor create access
- Non-Editor create denial
- Editor update access
- Non-Editor update denial

---

## Profiles Module

The following automated tests are planned for the Profiles application.

### Model Tests

* Create a Profile for a valid User
* Verify the one-to-one User relationship
* Prevent multiple Profiles for the same User
* Verify optional text fields default to empty strings
* Verify `date_of_birth` may be `NULL`
* Verify timestamp fields are populated
* Verify physical User deletion cascades to Profile
* Verify Profile string representation

### Signal Tests

* Create a Profile automatically when a new User is created
* Verify updating a User does not create another Profile
* Verify exactly one Profile exists per User
* Verify Profile creation through the Administrator user-provisioning flow
* Document that `bulk_create()` does not trigger `post_save` signals

### Data Migration Tests

* Create Profiles for Users without Profiles
* Preserve existing Profile records
* Prevent duplicate Profile creation
* Verify every existing User receives one Profile
* Verify the backfill operation is safe when some Profiles already exist

### Serializer Tests

* Verify private Profile representation
* Verify public Profile representation
* Verify Profile update fields
* Reject invalid website URLs
* Reject future dates of birth
* Accept valid past dates of birth
* Allow optional fields to be cleared
* Prevent User ownership assignment through request data
* Prevent username updates through the Profile serializer
* Prevent email updates through the Profile serializer
* Verify public responses exclude email
* Verify public responses exclude date of birth
* Verify internal identifiers and timestamps are not exposed publicly

### API Tests

* Retrieve the authenticated User's Profile
* Reject private Profile retrieval without authentication
* Partially update the authenticated User's Profile
* Reject Profile updates without authentication
* Return the complete private representation after update
* Retrieve a public Profile by username
* Return `404 Not Found` for an unknown username
* Verify the public Profile endpoint is read-only
* Verify `POST`, `PUT`, and `DELETE` are not allowed on `/api/profile/`
* Verify Profile updates persist correctly
* Verify omitted fields remain unchanged during `PATCH`
* Verify optional fields can be cleared
* Verify query optimization with `select_related("user")`

### Permission and Ownership Tests

* Authenticated Users can retrieve their own Profile
* Authenticated Users can update their own Profile
* Users cannot select another Profile through a URL identifier
* Users cannot select another Profile through request data
* Profile ownership cannot be reassigned
* Public users can retrieve safe public Profile information
* Public users cannot update Profiles
* Anonymous users cannot access private Profile information

### Security Tests

* Private Profile endpoints require JWT authentication
* Public Profile responses do not expose email addresses
* Public Profile responses do not expose date of birth
* Public Profile responses do not expose internal identifiers
* Profile update payloads cannot modify the owner
* Profile update payloads cannot modify username or email
* Future dates of birth are rejected
* Invalid website URLs are rejected
* Profile bio and location are treated as untrusted plain text
* Profile endpoint design prevents IDOR attacks

---

# Future Testing Coverage

As new features are completed, testing coverage will expand to include:

## Authentication

### Implemented:

- Registration
- Login
- Logout
- JWT Access Token
- JWT Refresh Token
- Protected User Endpoint

### Future:

- Password Change
- Password Reset
- Email Verification

---

## Posts

### Completed (Manual Verification)

- Create post
- List published posts
- Retrieve single post
- Update own post
- Soft delete own post
- Publish draft post
- Unpublish published post
- Invalid publishing transitions
- Publication timestamp management
- Slug generation
- Ownership enforcement
- Object-level permissions
- Assign categories
- Update categories
- Remove categories
- Nested category responses
- Category relationship validation
- Assign tags
- Update tags
- Remove tags
- Nested tag responses
- Tag relationship validation
- Shared taxonomy validation

### Future (Automated Tests)

- Publish workflow
- Restore deleted posts
- Pagination
- Filtering
- Search

---

## Comments

### Completed — Manual Verification

* Public Comment listing
* Authenticated Comment creation
* Anonymous creation denial
* Published-Post validation
* Invalid and hidden Post handling
* Missing content validation
* Blank content validation
* Whitespace-only content validation
* Maximum-length validation
* Backend-controlled author assignment
* Backend-controlled Post assignment
* Author-owned Comment updates
* Non-author update denial
* Author-owned Comment soft deletion
* Non-author delete denial
* Soft-deleted Comment exclusion
* Public response field validation
* Comment query optimization

### Future — Automated Tests

* Model behavior
* Serializer validation
* API integration
* Object-level permissions
* Ownership enforcement
* Soft-delete lifecycle
* Foreign-key deletion behavior
* Security regression tests

---

## Categories

### Completed (Manual Verification)

- Create category
- List active categories
- Retrieve category by slug
- Update category
- Duplicate name validation
- Automatic slug generation
- Editor-only management
- Active category filtering
- Category assignment to posts
- Category relationship validation
- Category reuse across multiple posts

### Future (Automated Tests)

- Model tests
- Serializer validation
- Permission enforcement
- API integration tests

---

## Tags Module

The following automated tests are planned for the Tags application:

### Model Tests

- Tag creation
- Unique slug generation
- Active status manager
- Audit field updates

### Serializer Tests

- Create serializer validation
- Update serializer validation
- Duplicate tag name validation
- Blank tag name validation

### API Tests

- Create tag
- List active tags
- Retrieve tag by slug
- Update tag
- Reject duplicate tag names
- Verify automatic slug generation

### Permission Tests

- Anonymous list access
- Anonymous retrieve access
- Editor create access
- Non-Editor create denial
- Editor update access
- Non-Editor update denial

### Relationship Tests

- Assign tags to posts
- Replace tags on posts
- Clear tags from posts
- Verify reverse post relationships
- Reject inactive tags
- Reject duplicate tag assignments

---

## Comments Module

The following automated tests are planned for the Comments application.

### Model Tests

* Create a Comment with a valid Post and author
* Verify the Post relationship
* Verify the author relationship
* Verify chronological ordering
* Verify the 2,000-character content limit
* Verify soft deletion
* Verify the unrestricted manager can access deleted Comments
* Verify the default manager excludes deleted Comments
* Verify physical User deletion is protected
* Verify physical Post deletion cascades to Comments

### Serializer Tests

* Validate Comment creation content
* Reject missing content
* Reject blank content
* Reject whitespace-only content
* Reject content exceeding 2,000 characters
* Verify leading and trailing whitespace normalization
* Prevent author assignment through request data
* Prevent Post assignment through request data
* Prevent author reassignment during updates
* Prevent Post reassignment during updates
* Verify nested public author representation
* Verify email and audit fields are not exposed

### API Tests

* List Comments for a published Post
* Return an empty list when a Post has no Comments
* Create a Comment on a published Post
* Reject Comment creation without authentication
* Reject Comment creation on an invalid Post
* Reject Comment creation on a draft Post
* Reject Comment creation on an unpublished Post
* Reject Comment creation on a soft-deleted Post
* Update an owned Comment
* Soft delete an owned Comment
* Verify `PUT` is not allowed
* Verify soft-deleted Comments disappear from the list
* Verify soft-deleted Comments cannot be updated
* Verify soft-deleted Comments cannot be deleted again
* Verify existing Comments remain stored when a Post is unpublished

### Permission and Ownership Tests

* Anonymous users can list Comments
* Anonymous users cannot create Comments
* Authenticated users can create Comments
* Comment authors can update their own Comments
* Non-authors cannot update another user's Comment
* Comment authors can delete their own Comments
* Non-authors cannot delete another user's Comment
* Post authors cannot modify another user's Comment
* `IsCommentAuthor` correctly enforces object-level ownership

### Security Tests

* Client-supplied author values are ignored or rejected
* Client-supplied Post values are ignored or rejected
* Hidden Posts return `404 Not Found`
* Public Comment responses do not expose email addresses
* Public Comment responses do not expose audit fields
* Comment content is treated as untrusted plain text

---

## Profiles

### Completed — Manual Verification

- Authenticated Profile retrieval
- Anonymous private Profile access denial
- Authenticated Profile partial updates
- Anonymous Profile update denial
- Public Profile retrieval
- Unknown username handling
- Public/private response separation
- Email privacy enforcement
- Date-of-birth privacy enforcement
- Website URL validation
- Future date-of-birth validation
- Optional Profile field clearing
- Backend-controlled ownership
- Prevention of ownership reassignment
- IDOR prevention
- Automatic Profile creation
- Existing User Profile backfill
- Duplicate Profile prevention
- User deletion cascade behavior
- Profile query optimization

### Future — Automated Tests

- Profile model behavior
- Signal behavior
- Data migration behavior
- Serializer validation
- Private Profile API integration
- Public Profile API integration
- Ownership enforcement
- Privacy regression tests
- One-to-one relationship constraints
- Query-count assertions

---

## Permissions

- Anonymous access
- Author permissions
- Editor permissions
- Admin permissions
- Object-level ownership checks

---

# Manual Verification Completed

During Features 03 and 04, the following scenarios were manually verified using API requests. This is a historical record: the public registration flow listed below was removed by Feature 15 and replaced by Administrator-controlled user provisioning.

### Authentication

- User registration
- Duplicate email validation
- Duplicate username validation
- Password confirmation validation
- Successful login
- Invalid login
- JWT token generation
- Accessing protected endpoints
- Unauthorized requests
- Logout
- Refresh token blacklisting
- Token refresh endpoint
- Token verification endpoint

### Posts

- Create post
- Create post without authentication
- Blank title validation
- Blank content validation
- Duplicate title with unique slug generation
- List published posts
- Retrieve post by slug
- Update own post
- Prevent updating another user's post
- Soft delete own post
- Prevent deleting another user's post
- Publish draft post
- Prevent publishing an already published post
- Unpublish published post
- Prevent unpublishing a draft post
- Prevent publishing another user's post
- Verify `published_at` is set during publishing
- Verify `published_at` is cleared during unpublishing
- Audit field verification (`created_by`, `updated_by`, `deleted_by`)
- Create post with categories
- Create post without categories
- Assign multiple categories
- Replace categories
- Remove all categories
- Preserve categories when omitted from update requests
- Reject invalid category slugs
- Reject inactive category slugs
- Reject duplicate category assignments
- Verify nested category responses in list endpoint
- Verify nested category responses in retrieve endpoint
- Create post with tags
- Create post without tags
- Assign multiple tags
- Replace tags
- Remove all tags
- Preserve tags when omitted from update requests
- Reject invalid tag slugs
- Reject inactive tag slugs
- Reject duplicate tag assignments
- Verify nested tag responses in list endpoint
- Verify nested tag responses in retrieve endpoint
- Verify category updates preserve tags
- Verify tag updates preserve categories
- Verify shared taxonomy validation mixin behavior

### Categories

- Create category
- Prevent duplicate category names
- Generate unique slug
- List active categories
- Retrieve category by slug
- Update category
- Prevent non-Editors from creating categories
- Prevent non-Editors from updating categories
- Verify audit fields (`created_by`, `updated_by`)
- Verify inactive categories are excluded by the default manager

### Tags

- Create tag
- Prevent duplicate tag names
- Generate unique slug
- List active tags
- Retrieve tag by slug
- Update tag
- Prevent non-Editors from creating tags
- Prevent non-Editors from updating tags
- Verify audit fields (`created_by`, `updated_by`)
- Verify inactive tags are excluded by the default manager

### Comments

* List Comments on a published Post
* Verify anonymous Comment listing
* Create a Comment as an authenticated user
* Prevent anonymous Comment creation
* Verify automatic author assignment
* Verify automatic parent Post assignment
* Prevent Comment creation on an invalid Post
* Prevent Comment creation on a draft or unpublished Post
* Prevent Comment creation on a soft-deleted Post
* Reject missing Comment content
* Reject blank Comment content
* Reject whitespace-only Comment content
* Reject Comment content exceeding 2,000 characters
* Update an owned Comment
* Prevent updating another user's Comment
* Prevent Comment author reassignment
* Prevent Comment Post reassignment
* Soft delete an owned Comment
* Prevent deleting another user's Comment
* Verify deleted Comments remain in the database
* Verify deleted Comments are excluded from normal API responses
* Verify deleted Comments cannot be updated or deleted again
* Verify public responses exclude email and audit fields
* Verify author loading uses `select_related("author")`
* Verify individual Comment operations load `author` and `post` efficiently

---

# Test Organization

As the project grows, tests will be organized within each Django application.

Example:

```text
apps/
├── users/
│   └── tests/
│       ├── test_models.py
│       ├── test_managers.py
│       ├── test_views.py
│       ├── test_permissions.py
│       └── test_serializers.py
│
├── posts/
│   ├── tests/
|   ├── test_models.py
|   ├── test_serializers.py
|   ├── test_views.py
|   ├── test_permissions.py
|   ├── test_managers.py
|   ├── test_api.py
|   └── test_relationships.py
|
├── categories/
│   └── tests/
│       ├── test_models.py
│       ├── test_managers.py
│       ├── test_serializers.py
│       ├── test_permissions.py
│       ├── test_views.py
│       └── test_api.py
├── tags/
|   └── tests/
|       ├── test_models.py
|       ├── test_managers.py
|       ├── test_serializers.py
|       ├── test_permissions.py
|       ├── test_views.py
|       └── test_api.py
|
├── comments/
│   └── tests/
│       ├── test_models.py
│       ├── test_serializers.py
│       ├── test_permissions.py
│       ├── test_views.py
│       └── test_api.py
├── profiles/
│   └── tests/
│       ├── test_models.py
│       ├── test_signals.py
│       ├── test_migrations.py
│       ├── test_serializers.py
│       ├── test_views.py
│       └── test_api.py
```

This structure keeps tests close to the code they verify.

---

# Testing Principles

Every test should answer at least one of the following questions:

- Does the feature work correctly?
- Can invalid input break the system?
- Are permissions enforced correctly?
- Can unauthorized users access protected resources?
- Does the database remain consistent?
- Will future changes accidentally break existing functionality?

---

# Frontend Testing and Verification

## Frontend Feature 01 Verification

Frontend Feature 01 relied on static, build, configuration, and manual browser verification:

* `npm run lint` verifies source and configuration lint rules.
* `npm run build` verifies environment loading, module reachability, transforms, Tailwind integration, and production bundling.
* The Home route, wildcard route, shared header/footer, and client-side Return home navigation were manually verified.
* A missing `VITE_API_BASE_URL` was verified to fail the Vite build after build-time validation was introduced; restoring configuration allowed lint and build to pass.
* Browser-runtime validation is implemented to reject missing, malformed, non-HTTP(S), and credential-bearing URLs. During Feature 01, the missing-variable build-time failure was manually verified; the remaining validation branches require automated or dedicated manual tests.
* Git ignore behavior was verified for `.env.local`, `node_modules/`, and `dist/`.
* Node `v24.18.0` and npm `11.16.0` were verified during documentation completion.
* Dependency installation succeeded and npm audit reported zero vulnerabilities at installation time.

No automated React tests were added during Feature 01 itself. Frontend Feature 02 subsequently introduced the automated frontend suite described below.

## Frontend Feature 02 Automated Testing

Frontend Feature 02 establishes a repeatable unit and integration suite with:

* Vitest 4 as the test runner
* jsdom as the browser-like test environment
* React Testing Library and `@testing-library/jest-dom` for rendered behavior and DOM assertions
* `@testing-library/user-event` for user interactions
* Axios Mock Adapter for deterministic API-client and interceptor behavior

The final Frontend Feature 02 suite contains 12 test files and 135 passing tests. It covers:

* Memory-only access-token storage, refresh-token persistence, cleanup, and unavailable-storage failure handling
* Exact authentication request/response adaptation for login, `/me`, logout, and rotating refresh
* Trusted-origin and API-path Authorization-header attachment without overwriting an explicit header
* Single-flight refresh for concurrent eligible `401` responses, one-retry limits, endpoint exclusions, and session invalidation
* Startup restoration, including refresh followed by authoritative `/me`, failure settlement, and React Strict Mode remount behavior
* `AuthProvider` login, logout, role helpers, state transitions, lifecycle cleanup, and absence of token values from context
* Normalized validation, invalid-credential, token, network, timeout, storage, and server errors
* Safe return paths, authentication guards, role-aware guards, login form behavior, and authentication-aware navigation
* Root layout integration with the authentication provider and navigation

These tests isolate frontend behavior with mocks; they do not claim to replace real backend integration testing. Playwright and Cypress are not installed. Broader end-to-end editorial workflows remain a future testing layer.

## Frontend Feature 02 Real-Stack Verification

The completed implementation was also exercised against the running Django backend and Vite frontend through Microsoft Edge controlled with the Chrome DevTools Protocol. The sanitized browser run passed 35 of 35 checks across login, `/me` identity and managed roles, protected navigation, refresh rotation, concurrent-request recovery, reload restoration, invalid-session handling, logout, and post-logout behavior.

Targeted backend integration checks additionally confirmed:

* CORS headers are returned for the allowed `http://localhost:5173` origin on `/api/` requests.
* A non-allowlisted origin does not receive an `Access-Control-Allow-Origin` header.
* Credentialed CORS is disabled and no wildcard origin is configured.
* A successful login advances `User.last_login`; rejected credentials do not perform a successful-login update.

The real-stack checks complement the mocked suite by validating browser-to-backend interoperability, while the automated Vitest suite supplies deterministic regression coverage for edge cases and concurrency.

## Final Verification Result

The final repository verification completed successfully:

* Frontend tests: 12 of 12 files and 135 of 135 tests passed.
* Frontend ESLint checks passed.
* The Vite production build passed.
* Django's system check passed.
* Django's dry-run migration check reported no model/migration drift.
* Python dependency consistency (`pip check`) passed.

---

# Tools

Backend verification uses:

- Django Test Framework
- Django REST Framework APITestCase
- Python unittest (via Django)
- Django Test Client

Frontend Feature 02 verification uses:

- Vitest 4
- jsdom
- React Testing Library
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- Axios Mock Adapter
- Microsoft Edge with the Chrome DevTools Protocol for the real-stack browser run

Additional tools may be introduced later if project requirements evolve.

---

# Current Project Status

## Completed

- ✅ Feature 01 — Project Foundation & Architecture
- ✅ Feature 02 — Custom User Model & User App Architecture
- ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
- ✅ Feature 04 — Posts Domain Architecture & Database Design
- ✅ Feature 05 — Publishing Workflow
- ✅ Feature 06 — Categories
- ✅ Feature 07 — Tags
- ✅ Feature 08 — Post–Category Relationship
- ✅ Feature 09 — Post–Tag Relationship
- ✅ Feature 10 — Comments
- ✅ Feature 11 — User Profiles
- ✅ Feature 12 — Search
- ✅ Feature 13 — Media Uploads
- ✅ Feature 14 — Permissions & Authorization
- ✅ Feature 15 — User Administration & Role Management
- ✅ Feature 16 — Performance Optimization
- ✅ Frontend Feature 01 — React Foundation
- ✅ Frontend Feature 02 — Authentication & Session Architecture

All ownership and permissions rely on the authenticated user (`request.user`) established in Feature 03.

## Testing Progress

Automated frontend authentication testing is implemented: the Frontend Feature 02 suite has 12 test files and 135 passing tests. The 35-of-35 real-stack Edge run and targeted CORS and `last_login` checks provide integration evidence. A broader automated backend test phase remains planned.

Authentication, Posts, Categories, Tags, Comments, Profiles, and all implemented cross-domain relationships have been comprehensively verified through manual API testing.

The project currently has validated:

- Authentication workflows
- CRUD operations for Posts
- Publishing workflow
- Authorization
- Object-level permissions
- Ownership enforcement
- Soft deletion
- Publication timestamp management
- Request validation
- Backend workflow validation
- Category CRUD operations
- Editor-only category management
- Automatic slug generation
- Duplicate category name validation
- Active category filtering
* Tag CRUD operations
* Editor-only tag management
* Automatic tag slug generation
* Duplicate tag name validation
* Active tag filtering
- Category assignment
- Category updates
- Category removal
- Nested category serialization
- Taxonomy relationship validation
- Tag assignment
- Tag updates
- Tag removal
- Nested tag serialization
- Shared taxonomy validation
- Post–Tag relationship synchronization
- Public Comment listing
- Authenticated Comment creation
- Comment content validation
- Published-Post validation
- Comment ownership enforcement
- Author-only Comment updates
- Author-only Comment soft deletion
- Soft-deleted Comment exclusion
- Backend-controlled Comment relationships
- Comment response security
- Comment query optimization
- Authenticated Profile retrieval
- Authenticated Profile updates
- Public Profile retrieval
- Profile ownership enforcement
- Public/private Profile response separation
- Profile privacy validation
- Website URL validation
- Future date-of-birth rejection
- Automatic Profile creation
- Existing User Profile backfill
- Duplicate Profile prevention
- User–Profile cascade deletion
- Profile query optimization

The testing strategy is defined, and automated coverage is being introduced incrementally as the project evolves.

## Historical Next Testing Milestone

Feature 12 subsequently introduced Search. At the time this historical milestone was written, Frontend Feature 02 — Authentication & Session Architecture was next and its testing tools had not yet been selected. Frontend Feature 02 is now complete with the Vitest-based suite and real-stack verification documented above.

---

## Frontend Feature 03 Automated Testing

Frontend Feature 03 extends the Vitest, jsdom, React Testing Library, user-event, and isolated Axios-mock strategy. Six new test files add 31 tests for:

* exact list and slug-detail API paths, page parameters, response-body returns, abort signals, slug encoding, and normalized `404` behavior;
* positive-integer page parsing, canonical query generation, noise/repetition removal, bounded direct-page navigation, stable date formatting, and image URL allowlisting;
* safe card rendering for list serializer fields and controlled unsafe-image fallback;
* list loading, success, empty, retry, pagination, invalid/out-of-range page recovery, and stale-response suppression;
* detail field rendering, retry behavior, dedicated not-found presentation, and hostile HTML/script content remaining inert text;
* centralized `/posts` and `/posts/:postSlug` route matching.

Final automated results on 2026-08-06:

```text
npm run test   18 files, 166 tests passed
npm run lint   passed
npm run build  passed (168 modules transformed)
```

The browser-only manual checklist covers anonymous list/detail access, next/previous/direct-page navigation, back/forward behavior, refresh on a paginated URL, missing and broken images, empty results, invalid and out-of-range page values, detail `404`, transient retry, responsive layouts, keyboard focus, and console/network inspection. Those checks are marked pending rather than passed because no interactive browser with a seeded running backend was available in this execution environment.

The historical next testing scope was expected to include:

* Search query validation
* Empty search query behavior
* Post title searching
* Post excerpt searching
* Post content searching
* Published and non-deleted Post filtering
* Search result ordering
* Search result pagination
* Anonymous search access
* Prevention of unpublished Post disclosure
* Query performance verification
* Future PostgreSQL full-text search behavior

A broader automated testing phase remains planned for:

* Authentication APIs
* Posts APIs
* Categories APIs
* Tags APIs
* Comments APIs
* Profiles APIs
* Object-level permissions
* Soft-delete lifecycle behavior
* Taxonomy relationship synchronization
* Signal behavior
* Data migration behavior
* Cross-domain integration
