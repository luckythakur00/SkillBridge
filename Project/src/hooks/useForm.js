import { useCallback, useState } from 'react';
import { validate as runValidation } from '../utils/validators';

// Controlled form state with validation. Rules come from utils/validators.
export function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      setValue(name, type === 'checkbox' ? checked : value);
    },
    [setValue],
  );

  const validate = (extraSchema = schema) => {
    const found = runValidation(extraSchema, values);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const reset = useCallback((next) => {
    setValues(next);
    setErrors({});
  }, []);

  return { values, errors, setErrors, setValue, handleChange, validate, reset };
}
