import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, List, ListItem, Link as ChakraLink } from '@chakra-ui/react';

export const Navigation = () => {
  return (
    <Box p={4} bg="teal.500">
      <Flex as="nav" justify="space-between" align="center">
        <List display="flex" gap={6}>
          <ListItem>
            <ChakraLink as={Link} to="/" color="white" _hover={{ textDecoration: 'underline' }}>
              Events
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ChakraLink as={Link} to="/event/1" color="white" _hover={{ textDecoration: 'underline' }}>
              Event
            </ChakraLink>
          </ListItem>
        </List>
      </Flex>
    </Box>
  );
};
