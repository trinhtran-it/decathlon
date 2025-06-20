import React, { useState } from 'react';
import { Card, Image, Text, Badge, Group, Button } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { useRouter } from 'next/router';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { notifications } from '@mantine/notifications';
import { Product } from '../types';

const useStyles = createStyles((theme) => ({
  card: {
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
  imageSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
  },
  image: {
    width: '100%',
    height: 220,
    objectFit: 'cover',
  },
}));

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { classes } = useStyles();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const updateStock = useProductStore((state) => state.updateStock);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.stock?.quantity && product.stock.quantity > 0) {
      try {
        setIsLoading(true);
        
        // Add to cart first for better UX
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || product.imageUrl || 'https://via.placeholder.com/150'
        };
        
        addItem(cartItem);
        
        // Immediately update the local state for a smooth UI experience
        updateStock(product.id, 1);
        
        // Then sync with server - use negative value to decrease stock
        const syncStockWithServer = useProductStore.getState().syncStockWithServer;
        await syncStockWithServer(product.id, -1);
        
        notifications.show({
          title: 'Added to cart',
          message: `${product.name} has been added to your cart`,
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to sync with server:', error);
        // Even if the server sync fails, keep the item in cart
        notifications.show({
          title: 'Warning',
          message: `${product.name} was added to your cart but inventory sync failed. Stock information may be inaccurate.`,
          color: 'yellow',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRefreshProducts = async () => {
    if (!isLoading) {
      try {
        setIsLoading(true);
        const fetchProducts = useProductStore.getState().fetchProducts;
        await fetchProducts();
      } catch (refreshError) {
        console.error('Failed to refresh products:', refreshError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Card withBorder radius="md" className={classes.card} onClick={handleCardClick} p="md">
      <Card.Section className={classes.imageSection}>
        <Image src={product.image} alt={product.name} className={classes.image} />
      </Card.Section>

      <Group position="apart" mt="md">
        <Text weight={500}>{product.name}</Text>
        <Badge color={product.stock?.quantity && product.stock.quantity > 0 ? 'green' : 'red'} variant="light">
          {product.stock?.quantity && product.stock.quantity > 0 ? `In Stock: ${product.stock.quantity}` : 'Out of Stock'}
        </Badge>
      </Group>
      
      <Text size="sm" color="dimmed" mt="sm">
        {product.description.length > 100 
          ? `${product.description.substring(0, 100)}...` 
          : product.description}
      </Text>
      
      <Group position="apart" mt="md">
        <Text size="xl" weight={700}>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}</Text>
        <Button 
          onClick={handleAddToCart} 
          disabled={!product.stock?.quantity || product.stock.quantity === 0 || isLoading}
          loading={isLoading}
        >
          Add to cart
        </Button>
      </Group>
    </Card>
  );
}