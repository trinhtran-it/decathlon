import { Button, Container, Text, Title, Group, Image } from '@mantine/core';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';

export default function Custom404() {
  return (
    <Container size="md" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <Title order={1} mb="lg">Page Not Found</Title>
      
      <Text size="lg" color="dimmed" mb="xl">
        The page you are looking for doesn't exist or has been moved.
      </Text>
      
      <Group position="center" mb="xl">
        <Link href="/" passHref>
          <Button leftIcon={<IconArrowLeft size={16} />}>
            Back to Home
          </Button>
        </Link>
      </Group>
    </Container>
  );
}