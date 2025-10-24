"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, PostFormValues } from '@/lib/schemas';
import FormSubmitButton from '../FormSubmitButton';
import { useActionState, useTransition } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Post } from '@/lib/types';

type FormState = {
  success: boolean;
  message: string;
};

type Props = {
  post?: Post | null;
  action: (
    prevState: FormState,
    formData: FormData,
  ) => Promise<FormState>;
};

const initialState: FormState = { success: false, message: '' };

export default function PostForm({ post, action }: Props) {
  const [formState, formAction, isPending] = useActionState(action, initialState);
  const [isTransitionPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
    },
  });

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast.success(formState.message);
      } else {
        toast.error(formState.message);
      }
    }
  }, [formState, reset, post]);

  const onSubmit = (data: PostFormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {!formState.success && formState.message && (
         <div role="alert" className="alert alert-error">
           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <span>Error: {formState.message}</span>
         </div>
      )}

      <div className="form-control">
        <label htmlFor="title" className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          id="title"
          {...register('title')}
          type="text"
          className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
          aria-invalid={errors.title ? "true" : "false"}
        />
        {errors.title && (
          <p role="alert" className="text-error text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="form-control">
        <label htmlFor="content" className="label">
          <span className="label-text">Content</span>
        </label>
        <textarea
          id="content"
          {...register('content')}
          className={`textarea textarea-bordered h-48 w-full ${
            errors.content ? 'textarea-error' : ''
          }`}
          aria-invalid={errors.content ? "true" : "false"}
        />
        {errors.content && (
          <p role="alert" className="text-error text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="form-control mt-6">
        <FormSubmitButton
          label={post ? 'Update Post' : 'Create Post'}
          disabled={isSubmitting || isPending || isTransitionPending || (!!post && !isDirty)}
        />
      </div>
    </form>
  );
}