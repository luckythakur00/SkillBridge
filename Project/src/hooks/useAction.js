import { useState } from 'react';
import { toast } from '../store/toastStore';

// Wraps a mutation with a pending flag and a success or error toast.
// Returns true when the action succeeded. Field errors go to the optional form.
export function useAction(action, { success, form } = {}) {
  const [pending, setPending] = useState(false);

  const run = async (...args) => {
    setPending(true);
    try {
      await action(...args);
      if (success) toast.success(typeof success === 'function' ? success(...args) : success);
      return true;
    } catch (error) {
      if (error.fieldErrors && form) form.setErrors(error.fieldErrors);
      else toast.error(error.message);
      return false;
    } finally {
      setPending(false);
    }
  };

  return [run, pending];
}
