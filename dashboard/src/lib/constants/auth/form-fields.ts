interface FormField {
  id: string;
  placeholder: string;
  type?: string;
}

const COMMON_AUTH_FIELDS = {
  email: {
    id: "email",
    placeholder: "Email",
    type: "email",
  },
  password: {
    id: "password",
    placeholder: "Password",
    type: "password",
  },
  name: {
    id: "name",
    placeholder: "Name",
    type: "text",
  },
} as const;

export const REGISTRATION_FIELDS: FormField[] = [
  COMMON_AUTH_FIELDS.name,
  COMMON_AUTH_FIELDS.email,
  COMMON_AUTH_FIELDS.password,
];

export const LOGIN_FIELDS: FormField[] = [
  COMMON_AUTH_FIELDS.email,
  COMMON_AUTH_FIELDS.password,
 
];
