# @input-kit/form

Type-safe form management for React with Zod schema validation. Inspired by react-hook-form, with a simpler API and built-in Zod integration.

## Comparison with react-hook-form

| Feature | @input-kit/form | react-hook-form |
|---|---|---|
| Bundle size | ~8 KB | ~10 KB |
| Validation | Zod only | native + resolvers |
| Field arrays | built-in | separate `useFieldArray` |
| Controller | not needed | `<Controller>` for controlled |
| DevTools | no | yes |
| Watch cause re-render | formState only | `useWatch` subscription |
| TypeScript | full | full |

## Installation

```bash
npm install @input-kit/form zod
```

## Quick Start

```tsx
import { useForm } from '@input-kit/form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    schema,
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData) => {
    await api.login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## API

### `useForm(options)`

```ts
const {
  register,       // bind to <input>, <select>, <textarea>
  handleSubmit,   // wrap your submit handler
  watch,          // read current field values (non-reactive)
  setValue,       // set a value programmatically
  getValues,      // read all/one values
  setError,       // set a field error manually
  clearErrors,    // clear one, many, or all errors
  reset,          // reset form to defaults
  trigger,        // manually trigger validation
  formState,      // reactive form state object
  control,        // pass to useFieldArray / useWatch / FormProvider
} = useForm(options);
```

### `UseFormOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `schema` | `z.ZodType<T>` | required | Zod schema for the form |
| `defaultValues` | `Partial<T>` | `{}` | Initial field values |
| `mode` | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'all'` | `'onSubmit'` | When to validate |
| `reValidateMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onChange'` | Re-validation mode after submit |
| `shouldFocusError` | `boolean` | `true` | Focus first error field on submit |

### `formState`

| Property | Type | Description |
|---|---|---|
| `errors` | `FieldErrors<T>` | Validation error messages keyed by field name |
| `isDirty` | `boolean` | Any field differs from its default value |
| `isSubmitting` | `boolean` | Submit handler is currently running |
| `isSubmitted` | `boolean` | Form has been submitted at least once |
| `isSubmitSuccessful` | `boolean` | Last submission completed without error |
| `isValid` | `boolean` | No validation errors present |
| `isValidating` | `boolean` | Async validation in progress |
| `dirtyFields` | `Record<keyof T, boolean>` | Per-field dirty tracking |
| `touchedFields` | `Record<keyof T, boolean>` | Per-field touched tracking |
| `submitCount` | `number` | Total number of submission attempts |

### `register(name)`

Spreads `name`, `onChange`, `onBlur`, and `ref` onto any HTML input element:

```tsx
<input {...register('email')} type="email" />
<select {...register('role')} />
<textarea {...register('bio')} />
```

### `handleSubmit(onValid, onInvalid?)`

```tsx
<form onSubmit={handleSubmit(
  (data) => console.log('valid', data),
  (errors) => console.log('invalid', errors),
)}>
```

### `watch(name?)`

Returns the current value for a field or all fields. **Does not cause re-renders** — use `useWatch` from `FormProvider` for reactive subscriptions.

```ts
const email = watch('email');     // T['email']
const all   = watch();            // T
```

### `setValue(name, value, options?)`

```ts
setValue('email', 'new@example.com');
setValue('email', 'new@example.com', {
  shouldValidate: true,  // trigger validation
  shouldDirty: true,     // mark field dirty
  shouldTouch: true,     // mark field touched
});
```

### `trigger(name?)`

```ts
const valid = await trigger();          // validate all, returns boolean
const ok    = await trigger('email');   // validate one field
const okAll = await trigger(['email', 'password']);
```

### `reset(values?)`

```ts
reset();                              // reset to defaultValues
reset({ email: 'pre@filled.com' });   // reset with new defaults
```

### `setError` / `clearErrors`

```ts
setError('email', { type: 'manual', message: 'Already taken' });

clearErrors('email');          // clear one field
clearErrors(['email', 'name']); // clear multiple
clearErrors();                  // clear all
```

## Field Arrays

```tsx
import { useForm, useFieldArray } from '@input-kit/form';

const schema = z.object({
  tags: z.array(z.object({ value: z.string().min(1) })),
});

function TagsForm() {
  const { register, control, handleSubmit } = useForm({
    schema,
    defaultValues: { tags: [{ value: '' }] },
  });

  const { fields, append, remove, swap } = useFieldArray({ control, name: 'tags' });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(`tags.${i}.value`)} />
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: '' })}>Add tag</button>
      <button type="submit">Save</button>
    </form>
  );
}
```

### `useFieldArray` methods

| Method | Signature | Description |
|---|---|---|
| `append` | `(value \| value[])` | Add to end |
| `prepend` | `(value \| value[])` | Add to beginning |
| `insert` | `(index, value \| value[])` | Insert at position |
| `remove` | `(index \| index[])` | Remove by index |
| `swap` | `(indexA, indexB)` | Swap two items |
| `move` | `(from, to)` | Move item to new position |
| `replace` | `(index, value)` | Replace item |
| `update` | `(index, value)` | Merge-update item |

`fields[i].id` is a stable unique key for React lists.

## FormProvider

Share form state across deeply nested components without prop drilling:

```tsx
import { FormProvider, useFormContext, useWatch } from '@input-kit/form';

function Parent() {
  const form = useForm({ schema });

  return (
    <FormProvider {...form}>
      <ChildInput />
      <EmailWatcher />
    </FormProvider>
  );
}

function ChildInput() {
  const { register, formState: { errors } } = useFormContext<MySchema>();
  return (
    <>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </>
  );
}

function EmailWatcher() {
  // useWatch subscribes reactively (causes re-render on change)
  const email = useWatch({ name: 'email' });
  return <p>Preview: {email}</p>;
}
```

## Validation Modes

| Mode | When validation runs |
|---|---|
| `onSubmit` (default) | Only on form submit |
| `onBlur` | When a field loses focus |
| `onChange` | On every keystroke |
| `all` | Both blur and change |

After the first submit, `reValidateMode` controls re-validation (default: `onChange`).

## TypeScript

All types are exported:

```ts
import type {
  FieldValues,
  FieldError,
  FieldErrors,
  FieldState,
  FormState,
  UseFormOptions,
  UseFormReturn,
  Control,
  FieldArrayOptions,
  UseFieldArrayReturn,
} from '@input-kit/form';
```

## License

MIT © Harshit
