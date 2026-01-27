import { NextResponse } from 'next/server';

// IMPORTANT: This is a BASIC authentication example for development only.
// For production, implement proper authentication with:
// - Database user table with hashed passwords (bcrypt)
// - JWT tokens with proper signing and expiration
// - Secure session management
// - Rate limiting
// - HTTPS only

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // TEMPORARY: Hard-coded credentials (REPLACE THIS IN PRODUCTION!)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple token (in production, use JWT with proper signing)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        message: 'Login successful',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
