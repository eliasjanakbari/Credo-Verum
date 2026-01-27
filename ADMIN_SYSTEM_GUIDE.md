# Admin System Guide

This document explains the admin interface that has been created for managing your SQL database.

## Overview

The admin system provides a web-based interface for:
- Submitting new evidence with form-based data entry
- Approval workflow for new submissions
- Managing existing data (CRUD operations)
- Basic authentication protection

## Setup Required

### 1. Create the Pending Submissions Table

Run the SQL script to create the required table for the approval workflow:

```bash
# Option 1: Run directly with Node.js
node -e "const sql = require('mssql'); const fs = require('fs'); const { getPool } = require('./lib/db/sql-helpers'); (async () => { const pool = await getPool(); const script = fs.readFileSync('./create-pending-table.sql', 'utf8'); await pool.request().query(script); console.log('Table created successfully'); })();"

# Option 2: Run the SQL file directly in Azure Portal Query Editor
# Copy the contents of create-pending-table.sql and execute in Azure
```

### 2. Configure Authentication

Add these environment variables to your `.env` file and Vercel:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

**IMPORTANT:** The current authentication is basic and meant for development. For production, you should implement:
- Password hashing with bcrypt
- JWT tokens with proper signing
- Session management
- Rate limiting
- HTTPS-only cookies

## Features

### 1. Evidence Submission Form (`/admin/submit-evidence`)

**Features:**
- Select existing authors or create new ones
- Select existing works or create new ones (filtered by selected author)
- Link to existing manuscripts
- Multi-select tags from existing options
- Form validation
- Submits to pending approval queue

**Workflow:**
1. User fills out the form
2. Submission is saved to `PendingSubmission` table with status 'Pending'
3. Admin reviews in the approvals page
4. If approved, data is inserted into proper tables
5. If rejected, submission is marked as rejected with notes

### 2. Approval Workflow (`/admin/approvals`)

**Features:**
- View all pending submissions
- Preview submission data
- Detailed view with all fields
- Approve or reject with notes
- Automatic insertion on approval

**Approval Process:**
When approved, the system:
1. Creates new Author (if needed)
2. Creates new Work (if needed)
3. Creates Evidence record
4. Creates EvidencePassage record
5. Links to Manuscript (if selected)
6. Links to Tags (if selected)
7. Updates pending submission status

All operations are wrapped in a SQL transaction for data integrity.

### 3. Manage Data (`/admin/manage`)

**Currently Implemented:**
- Authors management (full CRUD)
  - List all authors
  - Search by name
  - Edit author details
  - Delete authors (with validation)

**To Be Implemented:**
- Works management
- Manuscripts management
- Tags management
- Evidence management

### 4. Authentication (`/admin/login`)

**Current Implementation:**
- Simple username/password login
- Token stored in localStorage
- Basic credential validation

**Production Recommendations:**
- Use NextAuth.js or similar authentication library
- Store tokens in httpOnly cookies
- Implement JWT with proper signing
- Add password hashing with bcrypt
- Add rate limiting
- Add 2FA for extra security
- Create user management system in database

## API Routes

### Dropdown Data
- `GET /api/admin/authors` - List all authors
- `GET /api/admin/works?authorId=X` - List works (optionally filtered by author)
- `GET /api/admin/manuscripts` - List all manuscripts
- `GET /api/admin/tags` - List all tags

### Submissions
- `POST /api/admin/submit-evidence` - Submit new evidence for approval
- `GET /api/admin/pending-submissions` - Get all pending submissions
- `POST /api/admin/approve-submission` - Approve or reject a submission

### CRUD Operations
- `PUT /api/admin/authors/[id]` - Update author
- `DELETE /api/admin/authors/[id]` - Delete author

## Database Schema Updates

### New Table: PendingSubmission

```sql
CREATE TABLE PendingSubmission (
    PendingID INT IDENTITY(1,1) PRIMARY KEY,
    SubmissionData NVARCHAR(MAX) NOT NULL, -- JSON string
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    SubmittedBy NVARCHAR(255),
    SubmittedDate DATETIME DEFAULT GETDATE(),
    ReviewedBy NVARCHAR(255),
    ReviewedDate DATETIME,
    ReviewNotes NVARCHAR(MAX)
);
```

## Usage Instructions

### For Content Managers (Submitting Evidence)

1. Navigate to `/admin/submit-evidence`
2. Fill out the form:
   - Select existing author OR create new one
   - Select existing work OR create new one
   - Enter evidence details (passage text, summary, etc.)
   - Optionally link to manuscript
   - Select relevant tags
3. Click "Submit for Approval"
4. Wait for admin approval

### For Admins (Approving Submissions)

1. Navigate to `/admin/approvals`
2. Review pending submissions
3. Click "View Details" to see full submission
4. Review all fields carefully
5. Add review notes (optional)
6. Click "Approve & Publish" or "Reject"

### For Admins (Managing Data)

1. Navigate to `/admin/manage`
2. Select entity type (Authors, Works, etc.)
3. Search/filter as needed
4. Edit or delete records

## Security Considerations

### Current State (Development)
- Basic authentication with hard-coded credentials
- Simple token-based auth
- No rate limiting
- No session management

### Recommended for Production
1. **Authentication:**
   - Use NextAuth.js or Auth0
   - Implement proper JWT signing
   - Use httpOnly cookies
   - Add refresh tokens

2. **Authorization:**
   - Create user roles table
   - Implement role-based access control
   - Add user management interface

3. **API Security:**
   - Add API rate limiting
   - Implement CSRF protection
   - Add request validation
   - Use parameterized queries (already done)

4. **Database:**
   - Add audit logging table
   - Track who made changes
   - Add soft deletes instead of hard deletes
   - Implement database backups

5. **Frontend:**
   - Add client-side validation
   - Implement proper error handling
   - Add loading states
   - Add success/error notifications

## Next Steps

### Immediate Tasks
1. Run the SQL script to create PendingSubmission table
2. Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables
3. Test the submission workflow
4. Test the approval workflow

### Future Enhancements
1. Implement full CRUD for Works, Manuscripts, Tags, and Evidence
2. Add bulk import functionality
3. Add export functionality (CSV/JSON)
4. Implement proper authentication system
5. Add user management
6. Add audit logging
7. Add data validation rules
8. Add rich text editor for bio/summary fields
9. Add image upload for author photos
10. Add pagination for large datasets

## Troubleshooting

### Submission Form Not Loading
- Check that all API routes are working
- Verify DATABASE_URL is set correctly
- Check browser console for errors

### Approval Failing
- Check SQL transaction logs
- Verify all required fields are present
- Check for foreign key constraints

### Authentication Not Working
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set
- Check browser localStorage for token
- Try clearing browser cache

## File Structure

```
app/
├── admin/
│   ├── page.tsx                    # Dashboard
│   ├── login/page.tsx              # Login page
│   ├── submit-evidence/page.tsx    # Submission form
│   ├── approvals/page.tsx          # Approval workflow
│   └── manage/
│       ├── page.tsx                # Manage data hub
│       └── authors/page.tsx        # Authors management
├── api/
│   └── admin/
│       ├── login/route.ts          # Login endpoint
│       ├── authors/
│       │   ├── route.ts            # List authors
│       │   └── [id]/route.ts       # Update/delete author
│       ├── works/route.ts          # List works
│       ├── manuscripts/route.ts    # List manuscripts
│       ├── tags/route.ts           # List tags
│       ├── submit-evidence/route.ts       # Submit for approval
│       ├── pending-submissions/route.ts   # Get pending
│       └── approve-submission/route.ts    # Approve/reject
└── lib/
    └── db/
        └── sql-helpers.ts          # Database connection
```

## Support

For issues or questions, refer to:
- Azure SQL documentation
- Next.js documentation
- This guide's troubleshooting section
