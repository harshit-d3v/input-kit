/**
 * Demo for @input-kit/form
 * Form validation with Zod
 */

import React from 'react';
import { z } from 'zod';
import { useForm, useFieldArray, FormProvider, useFormContext, useWatch } from '../src/index';

const sectionStyle: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  background: '#fff',
};

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginTop: '4px',
  border: hasError ? '2px solid #ef4444' : '1px solid #cbd5e1',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
});

const errorStyle: React.CSSProperties = { color: '#ef4444', fontSize: '12px', marginTop: '4px' };

// Demo 1: Basic form with Zod validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
type LoginData = z.infer<typeof loginSchema>;

function BasicExample() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginData>({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = (data: LoginData) => {
    alert(`Submitted:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div style={sectionStyle}>
      <h2>Basic Login Form</h2>
      <p>Validates on blur using Zod. Errors appear after leaving each field.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input {...register('email')} type="email" style={inputStyle(!!errors.email)} placeholder="you@example.com" />
          {errors.email && <div style={errorStyle}>{errors.email.message}</div>}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Password</label>
          <input {...register('password')} type="password" style={inputStyle(!!errors.password)} placeholder="Min 8 characters" />
          {errors.password && <div style={errorStyle}>{errors.password.message}</div>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" style={{ padding: '8px 20px' }}>Login</button>
          <button type="button" onClick={() => reset()} style={{ padding: '8px 20px' }}>Reset</button>
        </div>
      </form>
    </div>
  );
}

// Demo 2: Validation modes + live isValid / isDirty
const signupSchema = z.object({
  username: z.string().min(3, 'Min 3 characters').max(20, 'Max 20 characters'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type SignupData = z.infer<typeof signupSchema>;

function ValidationExample() {
  const { register, handleSubmit, formState: { errors, isValid, isDirty } } = useForm<SignupData>({
    schema: signupSchema,
    defaultValues: { username: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  return (
    <div style={sectionStyle}>
      <h2>Signup with onChange Validation</h2>
      <p>Validates every keystroke. Submit button enables only when form is valid and dirty.</p>
      <form onSubmit={handleSubmit(console.log)}>
        <div style={{ marginBottom: '12px' }}>
          <label>Username</label>
          <input {...register('username')} style={inputStyle(!!errors.username)} placeholder="3-20 characters" />
          {errors.username && <div style={errorStyle}>{errors.username.message}</div>}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Password</label>
          <input {...register('password')} type="password" style={inputStyle(!!errors.password)} placeholder="Min 8 characters" />
          {errors.password && <div style={errorStyle}>{errors.password.message}</div>}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Confirm Password</label>
          <input {...register('confirmPassword')} type="password" style={inputStyle(!!errors.confirmPassword)} />
          {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword.message}</div>}
        </div>

        <button type="submit" disabled={!isValid || !isDirty} style={{ padding: '8px 20px' }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

// Demo 3: Dynamic field array
const teamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  members: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
  })).min(1, 'Add at least one member'),
});
type TeamData = z.infer<typeof teamSchema>;

function FieldArrayExample() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<TeamData>({
    schema: teamSchema,
    defaultValues: { teamName: '', members: [{ name: '', email: '' }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  const onSubmit = (data: TeamData) => {
    alert(`Team: ${data.teamName}\nMembers: ${data.members.length}`);
  };

  return (
    <div style={sectionStyle}>
      <h2>Dynamic Field Array</h2>
      <p>Add and remove team members dynamically. Uses useFieldArray.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '12px' }}>
          <label>Team Name</label>
          <input {...register('teamName')} style={inputStyle(!!errors.teamName)} placeholder="e.g. Frontend Squad" />
          {errors.teamName && <div style={errorStyle}>{errors.teamName.message}</div>}
        </div>

        {fields.map((field, i) => (
          <div key={field.id} style={{ padding: '12px', marginBottom: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px' }}>Member {i + 1}</strong>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  Remove
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <input {...register(`members.${i}.name`)} placeholder="Name" style={inputStyle(!!(errors.members?.[i]?.name))} />
                {errors.members?.[i]?.name && <div style={errorStyle}>{errors.members[i].name!.message}</div>}
              </div>
              <div>
                <input {...register(`members.${i}.email`)} placeholder="Email" style={inputStyle(!!(errors.members?.[i]?.email))} />
                {errors.members?.[i]?.email && <div style={errorStyle}>{errors.members[i].email!.message}</div>}
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="button" onClick={() => append({ name: '', email: '' })} style={{ padding: '8px 16px' }}>
            + Add Member
          </button>
          <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
        </div>
      </form>
    </div>
  );
}

// Demo 4: FormProvider + useFormContext + useWatch
const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});
type ProfileData = z.infer<typeof profileSchema>;

function ProfileField({ name, label, type = 'text' }: { name: keyof ProfileData; label: string; type?: string }) {
  const { register, formState: { errors } } = useFormContext<ProfileData>();
  const error = errors[name];
  return (
    <div style={{ marginBottom: '12px' }}>
      <label>{label}</label>
      <input {...register(name)} type={type} style={inputStyle(!!error)} />
      {error && <div style={errorStyle}>{error.message}</div>}
    </div>
  );
}

function LivePreview() {
  const values = useWatch<ProfileData>();
  return (
    <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '6px', marginTop: '12px', fontSize: '13px' }}>
      <strong>Live preview (useWatch):</strong>
      <pre style={{ margin: '6px 0 0', fontSize: '12px' }}>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}

function FormContextExample() {
  const methods = useForm<ProfileData>({
    schema: profileSchema,
    defaultValues: { firstName: '', lastName: '', email: '' },
    mode: 'onChange',
  });

  return (
    <div style={sectionStyle}>
      <h2>FormProvider + useFormContext + useWatch</h2>
      <p>Share form state across nested components. useWatch shows reactive live values.</p>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(console.log)}>
          <ProfileField name="firstName" label="First Name" />
          <ProfileField name="lastName" label="Last Name" />
          <ProfileField name="email" label="Email" type="email" />
          <LivePreview />
          <button type="submit" style={{ padding: '8px 20px', marginTop: '12px' }}>Save Profile</button>
        </form>
      </FormProvider>
    </div>
  );
}

// Demo 5: formState flags
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});
type TaskData = z.infer<typeof taskSchema>;

function FormStateExample() {
  const { register, handleSubmit, formState: { isDirty, isValid, isSubmitting, isSubmitted, isSubmitSuccessful, submitCount, errors }, reset } =
    useForm<TaskData>({
      schema: taskSchema,
      defaultValues: { title: '', description: '' },
      mode: 'onChange',
    });

  const onSubmit = async (data: TaskData) => {
    await new Promise((r) => setTimeout(r, 800));
    console.log('Submitted:', data);
  };

  const badge = (active: boolean) => (
    <span style={{ marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: active ? '#dcfce7' : '#f1f5f9', color: active ? '#16a34a' : '#64748b' }}>
      {active ? 'true' : 'false'}
    </span>
  );

  return (
    <div style={sectionStyle}>
      <h2>Form State Tracking</h2>
      <p>All formState flags in real time.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '12px' }}>
            <label>Title (required)</label>
            <input {...register('title')} style={inputStyle(!!errors.title)} placeholder="Task title" />
            {errors.title && <div style={errorStyle}>{errors.title.message}</div>}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Description (optional)</label>
            <textarea {...register('description')} style={{ ...inputStyle(), resize: 'vertical' }} rows={2} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px' }}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => reset()} style={{ padding: '8px 16px' }}>Reset</button>
          </div>
        </form>

        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', lineHeight: '1.8' }}>
          <div>isDirty {badge(isDirty)}</div>
          <div>isValid {badge(isValid)}</div>
          <div>isSubmitting {badge(isSubmitting)}</div>
          <div>isSubmitted {badge(isSubmitted)}</div>
          <div>isSubmitSuccessful {badge(isSubmitSuccessful)}</div>
          <div>submitCount <strong style={{ marginLeft: '6px' }}>{submitCount}</strong></div>
        </div>
      </div>
    </div>
  );
}

export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>@input-kit/form</h1>
      <p style={{ color: '#64748b' }}>Type-safe React form management with Zod schema validation.</p>
      <BasicExample />
      <ValidationExample />
      <FieldArrayExample />
      <FormContextExample />
      <FormStateExample />
    </div>
  );
}

export default Demo;