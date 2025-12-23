# Supabase Migrations

This folder contains all the database migrations for the SalesHub v3 project.

## Migration Files

### 20251223_001_initial_setup_users_table.sql
- Creates the `Users` table with columns: `id`, `name`, `email`, `role`
- Creates `user_role` enum type with values: 'Admin', 'User'
- Enables Row Level Security (RLS) on Users table
- Creates sync triggers to automatically sync `auth.users` with `public.Users`
- Initial RLS policies for user access control

### 20251223_002_refined_rls_policies.sql
- Updates RLS policies to use `app_metadata` instead of `user_metadata` for security
- Separates admin permissions into granular policies:
  - Users can view their own profile
  - Admins can view all profiles
  - Admins can update any profile
  - Admins can delete any profile
  - Admins can insert new profiles
- Updates sync function to prioritize `app_metadata` for role assignment

### 20251223_003_create_admin_user.sql
- Creates the initial admin user:
  - Name: Fardin
  - Email: fardinahmed66@gmail.com
  - Password: fardin123456
  - Role: Admin
- Fixes NULL string field issues in `auth.users` table
- Ensures all token fields are empty strings instead of NULL to prevent auth errors

## How to Apply Migrations

These migrations have already been applied to the Supabase project `nvcterprkjlffbrdtppg`.

If you need to apply them to a new project or reset the database:

1. Use the Supabase CLI:
   ```bash
   supabase db push
   ```

2. Or apply manually through the Supabase dashboard SQL editor

3. Or use the MCP server tools to apply migrations programmatically

## Database Schema

### public.Users Table
```sql
Column | Type      | Description
-------|-----------|------------
id     | uuid      | Primary key, references auth.users(id)
name   | text      | User's display name
email  | text      | User's email address
role   | user_role | User role (Admin or User)
```

### Row Level Security Policies
- **Users can view their own profile**: Any authenticated user can SELECT their own record
- **Admins can view all profiles**: Admins can SELECT all records
- **Admins can update profiles**: Admins can UPDATE any record
- **Admins can delete profiles**: Admins can DELETE any record
- **Admins can insert profiles**: Admins can INSERT new records

### Triggers
- **on_auth_user_created**: Automatically creates a record in `public.Users` when a user signs up
- **on_auth_user_updated**: Automatically updates the `public.Users` record when auth user data changes

## Security Notes

- User roles are stored in `app_metadata` which cannot be modified by end users
- RLS policies check the JWT `app_metadata.role` field to determine admin access
- All admin operations require the user to have `app_metadata.role = 'Admin'`
