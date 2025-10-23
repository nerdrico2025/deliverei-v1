
import { useState, useCallback, ChangeEvent } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type ValidatorFn<T> = (values: T) => FormErrors<T>;

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: ValidatorFn<T>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
}

/**
 * Custom hook para gerenciamento de formulários
 * Simplifica validação, state management e submissão
 * 
 * @template T - Tipo dos valores do formulário
 * @param options - Configurações do formulário
 * @returns objeto com controles do formulário
 * 
 * @example
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 * 
 * const form = useForm<LoginForm>({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: FormErrors<LoginForm> = {};
 *     if (!values.email) errors.email = 'Email é obrigatório';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await loginApi(values);
 *   }
 * });
 * 
 * // No JSX
 * <form onSubmit={form.handleSubmit}>
 *   <input 
 *     value={form.values.email}
 *     onChange={form.handleChange('email')}
 *     onBlur={form.handleBlur('email')}
 *   />
 *   {form.errors.email && form.touched.email && <span>{form.errors.email}</span>}
 * </form>
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T) => {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      
      setValues(prev => ({
        ...prev,
        [field]: value,
      }));
    };
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({
        ...prev,
        [field]: true,
      }));

      // Validate on blur if validator exists
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
      }
    };
  }, [values, validate]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    // Validate
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Don't submit if there are errors
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    // Submit
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

