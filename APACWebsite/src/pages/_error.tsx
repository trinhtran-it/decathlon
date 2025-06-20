import { NextPageContext } from 'next';
import { Button, Container, Text, Title, Group } from '@mantine/core';
import Link from 'next/link';

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <Container style={{ textAlign: 'center', paddingTop: '50px' }}>
      <Title order={1} mb="lg">
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </Title>
      <Text size="lg" mb="xl">
        {statusCode === 404
          ? 'The page you are looking for might have been removed or is temporarily unavailable.'
          : 'Sorry, something went wrong on our end. We\'re working on fixing this issue.'}
      </Text>
      <Group position="center">
        <Link href="/" passHref>
          <Button>Back to Home</Button>
        </Link>
      </Group>
    </Container>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode || 500 : 404;
  return { statusCode };
};

export default Error;