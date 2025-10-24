"use client";

import { useFormStatus } from 'react-dom';

type Props = {
  label: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function FormSubmitButton({ label, ...props }: Props) {
  const { pending } = useFormStatus();

  return (
    <button {...props} type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? <span className="loading loading-spinner"></span> : label}
    </button>
  );
}