const auditReport = {
  title: 'PixelThread API Consistency Audit Report',
  date: new Date().toISOString(),
  summary: {
    totalEndpoints: 112,
    modules: 18,
    status: 'Production-ready with minor inconsistencies noted below.',
  },
  findings: [
    {
      category: 'Response Format Consistency',
      severity: 'medium',
      issue: 'Mixed pagination response formats across modules.',
      details:
        'Some modules use `{ items, pagination }` (admin, search history) while others use `{ posts, pagination }` (post service), `{ notifications, pagination }` (notifications), `{ reports, pagination }` (reports), `{ media, pagination }` (media). This creates inconsistency for API consumers.',
      recommendation:
        'Standardize all paginated responses to `{ items, pagination }` across all modules to match the admin module convention.',
    },
    {
      category: 'Response Format Consistency',
      severity: 'low',
      issue: 'Single-item responses use different top-level key names.',
      details:
        '`GET /api/auth/me` returns `data` directly with user fields. `GET /api/admin/users/:id` returns `{ user, statistics, reports }` under `data`. Some endpoints return objects at top level vs nested under `data`.',
      recommendation:
        'Audit all single-item responses to ensure consistent data wrapping.',
    },
    {
      category: 'Pagination',
      severity: 'low',
      issue: 'Inconsistent pagination property names.',
      details:
        'Post service uses `{ page, limit, totalPages, hasNextPage, hasPrevPage }` while admin service uses `{ currentPage, totalPages, hasNextPage, hasPreviousPage, totalItems }`.',
      recommendation: 'Standardize pagination metadata across all modules.',
    },
    {
      category: 'Status Codes',
      severity: 'low',
      issue: 'Inconsistent status codes for deletion.',
      details:
        'Post deletion returns 200 with success message. Comment deletion returns 200. Some REST APIs prefer 204 No Content for deletions.',
      recommendation:
        'Consider using 200 with message for consistency with existing clients, or migrate to 204.',
    },
    {
      category: 'Status Codes',
      severity: 'low',
      issue: 'Mixed 200 vs 201 for creation.',
      details:
        'Post creation returns 201. Comment creation returns 201. Report submission returns 200. Tag creation returns 201. Announcement creation returns 201. Media upload returns 201.',
      recommendation:
        'Ensure all creation endpoints consistently return 201 status code.',
    },
    {
      category: 'Authentication',
      severity: 'info',
      issue: 'Cookie-only authentication limits API client flexibility.',
      details:
        'The API uses httpOnly cookies for JWT tokens, which prevents browser-based Swagger UI "Try it out" from working directly since cookies cannot be set via JavaScript.',
      recommendation:
        'Consider adding support for Authorization: Bearer header as a fallback authentication method for API clients and Swagger UI.',
    },
    {
      category: 'Error Handling',
      severity: 'low',
      issue: 'Error response format variations.',
      details:
        'Auth middleware errors use `sendError()` directly (bypassing the global error handler) while service-layer errors go through `next(err)` and the global error handler. Both use `{ success: false, message }` format, but auth middleware errors may lack the `errors` array.',
      recommendation:
        'Route all errors through the global error handler for consistent error formatting.',
    },
    {
      category: 'Validation',
      severity: 'info',
      issue: 'Validation is done in controllers, not via middleware.',
      details:
        'Input validation is performed in controller functions (calling validation module functions), not through dedicated validation middleware. This works but makes the validation layer less visible and harder to audit.',
      recommendation:
        'Consider a middleware-based validation approach for request body, query, and params validation using a consistent pattern.',
    },
    {
      category: 'Naming Conventions',
      severity: 'low',
      issue: 'Route path naming inconsistency.',
      details:
        'Most routes use kebab-case (`/read-all`, `/unread-count`, `/like-status`, `/popular-tags`, `/audit-logs`). This is consistent and good. However, some admin routes could be grouped differently.',
      recommendation:
        'Maintain kebab-case for all multi-word route paths. Current usage is consistent.',
    },
    {
      category: 'Security',
      severity: 'info',
      issue: 'Admin endpoints log audit trails.',
      details:
        'All sensitive admin actions (ban, unban, role change, verify, post operations, comment moderation, media deletion, announcements, settings changes) are logged to AdminAuditLog. This is correctly implemented.',
      recommendation: 'None — this is properly implemented.',
    },
    {
      category: 'Security',
      severity: 'info',
      issue: 'Self-targeting prevention.',
      details:
        'Admin endpoints correctly prevent self-ban, self-role-change, etc. This is consistent with security requirements.',
      recommendation: 'None — this is properly implemented.',
    },
    {
      category: 'Documentation Coverage',
      severity: 'info',
      issue: 'All endpoints documented in OpenAPI spec.',
      details:
        'All 112+ endpoints across 18 modules are documented in the OpenAPI 3.1 specification with tags, parameters, request bodies, responses, security requirements, and examples.',
      recommendation: 'None — full coverage achieved.',
    },
    {
      category: 'File Upload',
      severity: 'info',
      issue: 'File upload validation documented.',
      details:
        'File upload endpoints document supported MIME types (JPEG, PNG, WebP, GIF), max file size (10MB), and multipart/form-data requirements.',
      recommendation: 'None — properly documented.',
    },
    {
      category: 'Rate Limiting',
      severity: 'info',
      issue: 'Rate limit documentation.',
      details:
        'Rate-limited endpoints (auth routes, search, AI) are documented with 429 response codes. Specific rate limit values should be documented in the description field.',
      recommendation:
        'Add specific rate limit values (requests/time window) to endpoint descriptions.',
    },
  ],
  recommendations: [
    'Standardize paginated responses to use `{ items, pagination }` format across all modules.',
    'Standardize pagination metadata fields to `{ totalItems, totalPages, currentPage, hasNextPage, hasPreviousPage }`.',
    'Ensure all creation endpoints return 201 status code.',
    'Add Bearer token authentication support alongside cookies for better API client compatibility.',
    'Document specific rate limit values in endpoint descriptions.',
    'Consider route-level validation middleware for a more declarative approach.',
  ],
};

module.exports = auditReport;
