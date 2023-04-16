import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const newPassword = {
      tokenId: router.query.token,
      password,
    };

    await fetch('/api/reset-password', {
      method: 'PUT',
      body: JSON.stringify(newPassword),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => {
        setIsLoading(false);
        toast({
          title: 'Password is reset',
          status: 'success',
          duration: 2000,
          position: 'top',
        });
      })
      .catch((error) => console.log('Error: ', error));

    router.replace('/');
  };

  return (
    <Flex
      w={'60%'}
      h={'60vh'}
      mx="auto"
      justifyContent={'center'}
      alignItems={'center'}
    >
      <VStack spacing={5} w={'100%'}>
        <Text textAlign={'center'}>Enter a new password for your account</Text>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <FormControl isRequired isInvalid={touched && password === ''} mb={2}>
            <Input
              type={'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={'New Password'}
              minLength={8}
              w={'100%'}
              onBlur={() => setTouched(true)}
            />
            <FormErrorMessage>Password is required</FormErrorMessage>
          </FormControl>
          <Button
            type={'submit'}
            w={'100%'}
            colorScheme={'blue'}
            isLoading={isLoading}
            isDisabled={!password}
          >
            Reset Password
          </Button>
        </form>
        <Text color={'#00000088'} _hover={{ color: 'blue.400' }}>
          <Link href={'/'}>Back to Login</Link>
        </Text>
      </VStack>
    </Flex>
  );
}
