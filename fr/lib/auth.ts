export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role?: string;
  };
  token?: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    user: {
      id: 'usr_demo',
      email: credentials.email,
      username: credentials.email.split('@')[0],
    },
    token: 'mock_jwt_token',
  };
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    user: {
      id: 'usr_demo',
      email: credentials.email,
      username: credentials.username,
      role: credentials.role,
    },
    token: 'mock_jwt_token',
  };
}
