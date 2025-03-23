import { Stack } from 'expo-router';
import { colors } from '../constants/colors';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.text,
    }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Sign In',
        }}
      />
    </Stack>
  );
} 