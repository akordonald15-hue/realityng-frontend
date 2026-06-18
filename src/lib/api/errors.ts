import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string; error?: { message?: string }; non_field_errors?: string[] }
      | undefined;

    return (
      data?.detail ??
      data?.error?.message ??
      data?.non_field_errors?.join(" ") ??
      "The request could not be completed."
    );
  }

  return "Something went wrong. Please try again.";
}
