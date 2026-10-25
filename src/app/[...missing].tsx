import React from 'react';
import { Redirect } from 'expo-router';

export default function NotFoundCatchAll() {
  return <Redirect href="/" />;
}
