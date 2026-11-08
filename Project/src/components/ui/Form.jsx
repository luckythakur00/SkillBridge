import { useId, useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Search, X } from 'lucide-react';

export function FormField({ id, label, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const errorRing = 'border-red-400 focus:border-red-500 focus:ring-red-500/15';

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

// A complete labelled input bound to a useForm instance.
export function Field({ form, name, label, hint, required, className, as = 'input', options, icon: Icon, placeholderOption, ...inputProps }) {
  const generatedId = useId();
  const id = inputProps.id ?? `${generatedId}-${name}`;
  const error = form.errors[name];
  const shared = {
    id,
    name,
    value: form.values[name] ?? '',
    onChange: form.handleChange,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, error, hint),
    ...inputProps,
  };
  const classes = `input-base ${error ? errorRing : ''} ${Icon ? 'pl-10' : ''}`;

  let control;
  if (as === 'select') {
    control = (
      <select className={classes} {...shared}>
        {placeholderOption && <option value="">{placeholderOption}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={4} className={`${classes} resize-y`} {...shared} />;
  } else if (as === 'password') {
    control = <PasswordInput className={classes} {...shared} />;
  } else {
    control = <input className={classes} {...shared} />;
  }

  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        {control}
      </div>
    </FormField>
  );
}

function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Hide password' : 'Show password';
  return (
    <>
      <input type={visible ? 'text' : 'password'} className={`${className} pr-10`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={label}
        title={label}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-700"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </>
  );
}

export function Checkbox({ id, name, checked, onChange, children, error }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search', label, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="input-base pr-9 pl-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-400 hover:text-slate-700"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label, allLabel }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="input-base w-full min-w-0 sm:w-auto sm:max-w-64 sm:min-w-40"
    >
      {allLabel && <option value="ALL">{allLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

// Large selectable tile, used for candidate category and organization type.
export function ChoiceTile({ selected, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
        selected ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {Icon && (
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-tight font-semibold text-slate-900">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
      {selected && <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />}
    </button>
  );
}
