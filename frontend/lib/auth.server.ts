import * as nextHeaders from 'next/headers';

import { User } from './types';
import 'server-only';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAuthenticatedUser(): Promise<User | null> {
  const token = (await nextHeaders.cookies()).get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}