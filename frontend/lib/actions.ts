"use server";

import * as nextHeaders from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as cookie from 'cookie';
import { postSchema, signInSchema, signUpSchema } from './schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FormState = {
  success: boolean;
  message: string;
};

// auth
export async function signInAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = signInSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, message: json.message || 'Sign in failed.' };
    }

    const setCookieHeader = res.headers.get('Set-Cookie');
    if (setCookieHeader) {
      const parsedCookie = cookie.parse(setCookieHeader);
      const [tokenName, tokenValue] = Object.entries(parsedCookie)[0];

      if (tokenName && typeof tokenValue === 'string') {
        const cookieStore = await nextHeaders.cookies();
        cookieStore.set(tokenName, tokenValue, {
          httpOnly: parsedCookie.HttpOnly === 'true',
          secure: parsedCookie.Secure === 'true',
          sameSite: parsedCookie.SameSite as 'lax' | 'strict' | 'none',
          path: parsedCookie.Path,
          maxAge: Number(parsedCookie['Max-Age']),
        });
      }
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUpAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = signUpSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Sign up failed.' };
    }
  } catch (error) {
    console.error('Sign-up error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }

  redirect('/auth/signin?message=Account created. Please sign in.');
}

export async function signOutAction() {
  const cookieStore = await nextHeaders.cookies();
  cookieStore.delete('auth_token');
  revalidatePath('/', 'layout');
  redirect('/');
}

// posts
export async function createPostAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = postSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const cookieStore = await nextHeaders.cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(validatedFields.data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Failed to create post.' };
    }
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }

  revalidatePath('/');
  redirect('/');
}

export async function updatePostAction(
  postId: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = postSchema.partial().safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const cookieStore = await nextHeaders.cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(validatedFields.data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Failed to update post.' };
    }
  } catch (error) {
    console.error('Update post error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }

  revalidatePath('/');
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePostAction(
  postId: string,
): Promise<FormState> {

  const headers: HeadersInit = {};

  const cookieStore = await nextHeaders.cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete post.');
    }
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, message: (error as Error).message };
  }

  revalidatePath('/');
  redirect('/');
  return { success: true, message: 'Post deleted' };
}