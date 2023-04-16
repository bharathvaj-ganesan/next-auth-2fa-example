import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import SignIn from './signin';
import SignUp from './signup';

export default function Form() {
  const [isSignInMode, setSignInMode] = useState<boolean>(false);
  return (
    <Flex flexDirection={{ base: 'column', md: 'row' }} w={{ base: '500px', md: '900px' }} h={{ base: '900px', md: '600px' }} boxShadow={'0 0 5px 5px #aaa'} borderRadius={'10px !important'}>
      <Box
        w={{ base: '100%', md: '50%' }}
        h={'100%'}
        bgColor={isSignInMode ? 'white' : '#319795'}
        borderLeftRadius={'10px'}
        borderBottomLeftRadius={{ base: '0', md: '10px', lg: '10px' }}
        borderTopRadius={'10px'}
        borderTopRightRadius={{ base: '10px', md: '0', lg: '0' }}
        transition={'0.5s ease-in'}
      >
        <SignIn isSignInMode={isSignInMode} setSignInMode={setSignInMode} />
      </Box>
      <Box
        w={{ base: '100%', md: '50%' }}
        h={'100%'}
        bgColor={isSignInMode ? '#319795' : 'white'}
        transition={'0.5s ease-in'}
        borderRightRadius={'10px'}
        borderBottomLeftRadius={{ base: '10px', md: '0', lg: '0' }}
        borderTopRadius={'0px'}
        borderTopRightRadius={{ base: '0', md: '10px', lg: '10px' }}
      >
        <SignUp isSignInMode={isSignInMode} setSignInMode={setSignInMode} />
      </Box>
    </Flex>
  );
}
