import { useState, useCallback, ChangeEvent } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) => {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
    const initialFields: Record<keyof T, FormField> = {} as any;
    Object.keys(initialValues).forEach((key) => {
      initialFields[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'This field is required';
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
      },
    }));
  }, [validateField]);

  const setFieldTouched = useCallback((name: keyof T, touched = true) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
      },
    }));
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof T;
    
    let fieldValue: any = value;
    if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    }

    setFieldValue(fieldName, fieldValue);
  }, [setFieldValue]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.target.name as keyof T;
    setFieldTouched(fieldName, true);
  }, [setFieldTouched]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(fields).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, fields[fieldName].value);
      newFields[fieldName] = {
        ...newFields[fieldName],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm() || !onSubmit) return;

    setIsSubmitting(true);
    try {
      const values = Object.keys(fields).reduce((acc, key) => {
        acc[key as keyof T] = fields[key as keyof T].value;
        return acc;
      }, {} as T);

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateForm, onSubmit]);

  const reset = useCallback(() => {
    const resetFields: Record<keyof T, FormField> = {} as any;
    Object.keys(initialValues).forEach((key) => {
      resetFields[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
      };
    });
    setFields(resetFields);
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((name: keyof T) => ({
    name: name as string,
    value: fields[name]?.value ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: fields[name]?.touched ? fields[name]?.error : null,
  }), [fields, handleChange, handleBlur]);

  const values = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].value;
    return acc;
  }, {} as T);

  const errors = Object.keys(fields).reduce((acc, key) => {
    const field = fields[key as keyof T];
    acc[key as keyof T] = field.touched ? field.error : null;
    return acc;
  }, {} as Record<keyof T, string | null>);

  const hasErrors = Object.values(errors).some(error => error !== null);

  return {
    values,
    errors,
    isSubmitting,
    hasErrors,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    validateForm,
  };
};