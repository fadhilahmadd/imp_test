"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import FormSubmitButton from "../FormSubmitButton";
import { deletePostAction } from "@/lib/actions";

type Props = {
  postId: string;
};

type FormState = {
  success: boolean;
  message: string;
};

const initialState: FormState = { success: false, message: "" };

export default function DeletePostForm({ postId }: Props) {
  const deleteActionWithId = deletePostAction.bind(null, postId);

  const [formState, formAction, isPending] = useActionState(
    deleteActionWithId,
    initialState
  );

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast.success(formState.message);
      } else {
        toast.error(formState.message);
      }
    }
  }, [formState]);

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleDelete}>
      <FormSubmitButton
        label="Delete"
        className="btn btn-error"
        disabled={isPending}
      />
      {!formState.success && formState.message && (
        <p className="text-error text-xs mt-1">{formState.message}</p>
      )}
    </form>
  );
}
