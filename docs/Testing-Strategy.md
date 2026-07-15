# Testing Strategy

# Testing Overview

Testing is a core part of the Blog Platform. Every major feature includes a defined automated testing strategy and undergoes manual verification until the automated test suite is implemented. This approach helps verify functionality, prevent regressions, and ensure long-term maintainability.

Testing will be introduced incrementally alongside feature development rather than postponed until the end of the project.

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

# Current Testing Status (Feature 10)

## Implemented

An automated test suite has not yet been created.

However, the Authentication, Posts, Categories, Tags, and Comments modules have been comprehensively verified through manual API testing during development.

Manual testing currently validates:

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

Automated tests will be introduced incrementally in future features.

---

# Planned Automated Tests

## Authentication Module

The following tests will be added when the testing phase begins:

### User Authentication Tests

- User registration
- Duplicate username validation
- Duplicate email validation
- Password confirmation validation
- Password strength validation
- Successful login
- Invalid login credentials
- Protected endpoint authentication
- Missing access token
- Invalid access token
- Logout
- Refresh token blacklisting
- Token refresh

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
- Staff create access
- Non-staff create denial
- Staff update access
- Non-staff update denial

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
- Staff-only management
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
- Staff create access
- Non-staff create denial
- Staff update access
- Non-staff update denial

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

## Permissions

- Anonymous access
- Writer permissions
- Editor permissions
- Admin permissions
- Object-level ownership checks

---

# Manual Verification Completed

During Features 03 and 04, the following scenarios were manually verified using API requests:

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
- Prevent non-staff users from creating categories
- Prevent non-staff users from updating categories
- Verify audit fields (`created_by`, `updated_by`)
- Verify inactive categories are excluded by the default manager

### Tags

- Create tag
- Prevent duplicate tag names
- Generate unique slug
- List active tags
- Retrieve tag by slug
- Update tag
- Prevent non-staff users from creating tags
- Prevent non-staff users from updating tags
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

# Tools

The project will primarily use:

- Django Test Framework
- Django REST Framework APITestCase
- Python unittest (via Django)
- Django Test Client

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

All ownership and permissions will rely on the authenticated user (`request.user`) established in Feature 03.

## Testing Progress

Automated testing has not yet been implemented.

Authentication, Posts, Categories, Tags, Comments, and all implemented cross-domain relationships have been comprehensively verified through manual API testing.

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
- Staff-only category management
- Automatic slug generation
- Duplicate category name validation
- Active category filtering
* Tag CRUD operations
* Staff-only tag management
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

The testing strategy is defined, and automated testing will be introduced incrementally as the project evolves.

## Next Testing Milestone

Feature 11 will introduce User Profiles.

The next testing scope is expected to include:

* User-to-Profile one-to-one relationships
* Automatic or controlled Profile creation
* Profile ownership
* Authenticated Profile updates
* Public and private Profile fields
* Protection of sensitive User information
* Profile serializer validation

A broader automated testing phase remains planned for:

* Authentication APIs
* Posts APIs
* Categories APIs
* Tags APIs
* Comments APIs
* Object-level permissions
* Soft-delete lifecycle behavior
* Taxonomy relationship synchronization
* Cross-domain integration