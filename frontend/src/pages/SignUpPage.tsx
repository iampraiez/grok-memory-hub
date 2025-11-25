import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export const SignUpPage: React.FC = () => {
  return <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />;
};
