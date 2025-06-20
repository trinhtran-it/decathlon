import React from 'react';
import { Container, Title, Text, Button, Group, Paper, Divider, NumberInput, ActionIcon, Image } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

const useStyles = createStyles((theme) => ({
  summary: {
    padding: theme.spacing.lg,
    position: 'sticky',
    top: theme.spacing.xl,
  },
  item: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.radius.sm,
  }
}));

export default function CartPage() {
  const { classes } = useStyles();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const { products, updateStock } = useProductStore();
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleQuantityChange = async (id: string, value: number, currentQuantity: number) => {
    const change = value - currentQuantity;
    
    try {
      // Sync with the server first
      // If increasing quantity: negative value to decrease stock
      // If decreasing quantity: positive value to increase stock
      const syncStockWithServer = useProductStore.getState().syncStockWithServer;
      await syncStockWithServer(id, -change);
      
      // If server sync successful, update local cart
      updateQuantity(id, value);
      
      // Refresh products to ensure we have the latest stock information
      await useProductStore.getState().fetchProducts();
      
      // We don't need to call updateStock since syncStockWithServer already updates the local state
    } catch (error) {
      console.error('Failed to sync with server:', error);
      notifications.show({
        title: 'Error',
        message: `Could not update quantity. Please try again.`,
        color: 'red',
      });
      
      // Try to refresh products anyway to get the latest stock information
      try {
        await useProductStore.getState().fetchProducts();
      } catch (refreshError) {
        console.error('Failed to refresh products:', refreshError);
      }
    }
  };

  const handleRemove = async (id: string, quantity: number) => {
    try {
      // Use the retry mechanism for better reliability
      const { retryStockOperation } = await import('../utils/batchStockOperations');
      
      // Sync with server first - use positive value to increase stock (add items back to inventory)
      await retryStockOperation(id, quantity);
      
      // If server sync is successful, update local cart
      removeItem(id);
      
      // Refresh products to ensure we have the latest stock information
      await useProductStore.getState().fetchProducts();
      
      // We don't need to call updateStock since syncStockWithServer already updates the local state
    } catch (error) {
      console.error('Failed to sync with server:', error);
      notifications.show({
        title: 'Error',
        message: `Could not remove item. Please try again.`,
        color: 'red',
      });
      
      // Try to refresh products anyway to get the latest stock information
      try {
        await useProductStore.getState().fetchProducts();
      } catch (refreshError) {
        console.error('Failed to refresh products:', refreshError);
      }
    }
  };
  
  if (items.length === 0) {
    return (
      <Container size="md">
        <Title order={2} mb="lg">Your Cart</Title>
        <Paper p="xl" withBorder>
          <Text align="center" my="xl">Your cart is empty</Text>
          <Link href="/" passHref>
            <Button leftIcon={<IconArrowLeft size={16} />} fullWidth>
              Continue Shopping
            </Button>
          </Link>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container size="xl">
      <Title order={2} mb="lg">Your Cart</Title>
      
      <Group align="flex-start" spacing="md" style={{ alignItems: 'stretch' }}>
        <div style={{ flex: 3 }}>
          {items.map((item) => {
            const product = products.find(p => p.id === item.id);
            const stockQuantity = product?.stock?.quantity ?? 0;
            const maxQuantity = item.quantity + stockQuantity;
            
            return (
              <Paper key={item.id} withBorder className={classes.item}>
                <Group position="apart">
                  <Group>
                    <div className={classes.imageContainer}>
                      <Image src={item.image} alt={item.name} className={classes.image} />
                    </div>
                    
                    <div>
                      <Text weight={500}>{item.name}</Text>
                      <Text size="sm" color="dimmed">
                        ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}
                      </Text>
                    </div>
                  </Group>
                  
                  <Group>
                    <NumberInput
                      value={item.quantity}
                      min={1}
                      max={maxQuantity}
                      onChange={(value) => handleQuantityChange(item.id, value || 1, item.quantity)}
                      styles={{ input: { width: 54 } }}
                    />
                    <Text weight={500}>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price * item.quantity)}</Text>
                    <ActionIcon color="red" onClick={() => handleRemove(item.id, item.quantity)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </div>
        
        <Paper className={classes.summary} withBorder style={{ flex: 1 }}>
          <Title order={4} mb="md">Order Summary</Title>
          
          <Group position="apart" mb="xs">
            <Text>Subtotal</Text>
            <Text>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(subtotal)}</Text>
          </Group>
          
          <Group position="apart" mb="xs">
            <Text>Tax (10%)</Text>
            <Text>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tax)}</Text>
          </Group>
          
          <Divider my="md" />
          
          <Group position="apart" mb="xl">
            <Text weight={500}>Total</Text>
            <Text weight={700} size="xl">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}</Text>
          </Group>
          
          <Button fullWidth mb="md">
            Proceed to Checkout
          </Button>
          
          <Button 
            variant="subtle" 
            color="red" 
            fullWidth 
            onClick={async () => {
              // Return all items to stock on server before clearing cart
              try {
                // Use the batch operation utility for better performance
                const { processBatchStockUpdates } = await import('../utils/batchStockOperations');
                const result = await processBatchStockUpdates(items, 'add');
                
                // Refresh products to ensure we have the latest stock information
                await useProductStore.getState().fetchProducts();
                
                if (result.success) {
                  clearCart();
                  notifications.show({
                    title: 'Cart Cleared',
                    message: 'All items have been removed from your cart',
                    color: 'blue',
                  });
                } else if (result.successCount > 0 && result.failCount > 0) {
                  // Partial success
                  notifications.show({
                    title: 'Warning',
                    message: `Cart partially cleared. ${result.failCount} items couldn't be processed.`,
                    color: 'yellow',
                  });
                } else {
                  throw new Error('Failed to sync with server');
                }
              } catch (error) {
                console.error('Failed to sync with server while clearing cart:', error);
                notifications.show({
                  title: 'Error',
                  message: 'Could not clear cart. Please try again.',
                  color: 'red',
                });
              }
            }}
          >
            Clear Cart
          </Button>
        </Paper>
      </Group>
      
      <Group position="left" mt="lg">
        <Link href="/" passHref>
          <Button leftIcon={<IconArrowLeft size={16} />} variant="subtle">
            Continue Shopping
          </Button>
        </Link>
      </Group>
    </Container>
  );
}