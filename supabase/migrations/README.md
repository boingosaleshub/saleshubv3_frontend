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

### 5.add_super_admin_role.sql
- Adds 'Super Admin' role to the `user_role` enum type
- Updates all RLS policies to include Super Admin permissions
- Super Admins have the same privileges as Admins (can be extended later)
- Updates sync function to handle Super Admin role from `app_metadata`
- Adds documentation comment to the enum type

### 6.fix_rls_recursion_super_admin_only.sql
- **CRITICAL FIX**: Resolves infinite recursion in RLS policies
- Creates `get_user_role()` security definer function to bypass RLS when checking roles
- **BREAKING CHANGE**: Restricts ALL user management to Super Admins only
- Regular Admins can no longer view, create, update, or delete users
- Adds `is_super_admin()` helper function for easy permission checks
- Applied: 2025-12-24

### 7.allow_admin_user_management.sql
- **PERMISSION UPDATE**: Allows both Admin and Super Admin to manage users
- Updates all RLS policies to include both 'Admin' and 'Super Admin' roles
- Adds `is_admin_or_super_admin()` helper function
- Both Admin and Super Admin can now create, read, update, and delete users
- Applied: 2025-12-24

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
role   | user_role | User role (User, Admin, or Super Admin)
```

### Row Level Security Policies
- **Users can view their own profile**: Any authenticated user can SELECT their own record
- **Admins and Super Admins can view all profiles**: Both Admins and Super Admins can SELECT all records
- **Admins and Super Admins can update profiles**: Both Admins and Super Admins can UPDATE any record
- **Admins and Super Admins can delete profiles**: Both Admins and Super Admins can DELETE any record
- **Admins and Super Admins can insert profiles**: Both Admins and Super Admins can INSERT new records

### Triggers
- **on_auth_user_created**: Automatically creates a record in `public.Users` when a user signs up
- **on_auth_user_updated**: Automatically updates the `public.Users` record when auth user data changes

## Security Notes

- User roles are stored in `app_metadata` which cannot be modified by end users
- RLS policies use a security definer function `get_user_role()` to prevent infinite recursion
- **Both Admins and Super Admins** can manage users and roles (view, create, update, delete)
- Regular Users have NO permissions to manage other users
- The `is_admin_or_super_admin()` helper function can be used in application logic for permission checks


