import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export const SignInPage: React.FC = () => {
  return <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />;
};
