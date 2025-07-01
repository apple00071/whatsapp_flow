import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-flow-secret-key';

// Default admin user for authentication
const defaultUsers = [
  {
    id: '1',
    email: 'applegraphicshyd@gmail.com',
    password: 'Admin@123456',
    name: 'Admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with matching credentials
    const user = defaultUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 