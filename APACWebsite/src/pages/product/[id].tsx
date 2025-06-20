import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Title, Group, Text, Badge, Button, Image, Grid, Paper, Box, Loader } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Product } from '../../types';

const useStyles = createStyles((theme) => ({
  productImage: {
    width: '100%',
    maxHeight: 500,
    objectFit: 'cover',
    borderRadius: theme.radius.md,
  },
  paper: {
    padding: theme.spacing.lg,
  },
}));

export default function ProductDetailPage() {
  const { classes } = useStyles();
  const router = useRouter();
  const { id } = router.query;
  const { products, fetchProductById, isLoading, error } = useProductStore();
  const { addItem } = useCartStore();
  const updateStock = useProductStore((state) => state.updateStock);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (id && typeof id === 'string') {
        const fetchedProduct = await fetchProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        }
      }
    };
    
    loadProduct();
  }, [id, fetchProductById]);
  
  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    
    if (product.stock?.quantity && product.stock.quantity > 0) {
      try {
        setAddingToCart(true);
        console.log('Adding to cart from detail page:', product.id, product.name);
        
        // Add to cart first for better UX
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || product.imageUrl || 'https://via.placeholder.com/150'
        };
        
        // Add item to cart
        addItem(cartItem);
        
        // Calculate the new stock quantity locally to avoid UI jerkiness
        const newStockQuantity = product.stock.quantity - 1;
        
        // Update local product state immediately for smooth UI
        setProduct(prev => {
          if (!prev || !prev.stock) return prev;
          return {
            ...prev,
            stock: {
              ...prev.stock,
              quantity: newStockQuantity
            }
          };
        });
        
        // Then sync with the server (use negative value to decrease stock)
        console.log('Syncing with server, decreasing stock by 1');
        const syncStockWithServer = useProductStore.getState().syncStockWithServer;
        await syncStockWithServer(product.id, -1);
        
        notifications.show({
          title: 'Added to cart',
          message: `${product.name} has been added to your cart`,
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to sync with server:', error);
        // Even if the server sync fails, keep the item in cart but inform the user
        notifications.show({
          title: 'Warning',
          message: `${product.name} was added to your cart but inventory sync failed. Stock information may be inaccurate.`,
          color: 'yellow',
        });
      } finally {
        setAddingToCart(false);
      }
    } else {
      notifications.show({
        title: 'Out of Stock',
        message: `${product.name} is currently out of stock`,
        color: 'yellow',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Container size="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }
  
  if (!product) {
    return (
      <Container>
        <Title order={3} mt="xl">Product not found</Title>
        <Link href="/" passHref>
          <Button leftIcon={<IconArrowLeft size={16} />} mt="md">
            Back to Products
          </Button>
        </Link>
      </Container>
    );
  }
  
  return (
    <Container size="xl">
      <Link href="/" passHref>
        <Button variant="subtle" leftIcon={<IconArrowLeft size={16} />} mb="md">
          Back to Products
        </Button>
      </Link>
      
      <Box>
        <Grid gutter="md">
          <Grid.Col span={12} md={6} style={{ overflow: 'hidden' }}>
            <Image src={product.image} alt={product.name} className={classes.productImage} />
          </Grid.Col>
          
          <Grid.Col span={12} md={6}>
            <Paper className={classes.paper} withBorder>
              <Title order={2}>{product.name}</Title>
              
              <Group position="apart" mt="md" mb="md">
                <Text size="xl" weight={700}>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}</Text>
                <Badge color={product.stock?.quantity && product.stock.quantity > 0 ? 'green' : 'red'} size="lg">
                  {product.stock?.quantity && product.stock.quantity > 0 
                    ? `In Stock: ${product.stock.quantity}` 
                    : 'Out of Stock'
                  }
                </Badge>
              </Group>
              
              {product.brand && (
                <Text size="md" weight={500} mb="xs">
                  Brand: {product.brand}
                </Text>
              )}
              
              {product.category && (
                <Text size="md" weight={500} mb="md">
                  Category: {product.category}
                </Text>
              )}
              
              <Text size="md" lineClamp={10} mb="md">
                {product.description}
              </Text>
              
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <Box mb="xl">
                  <Text weight={500} mb="xs">Product Details:</Text>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <Text key={key} size="sm">
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </Text>
                  ))}
                </Box>
              )}
              
              <Button 
                fullWidth 
                mt="xl"
                loading={addingToCart}
                disabled={!product.stock?.quantity || product.stock.quantity <= 0 || addingToCart}
                onClick={handleAddToCart}
                sx={{ 
                  height: '42px' // Set a fixed height to prevent layout shifting
                }}
              >
                {addingToCart ? '' : 'Add to Cart'}
              </Button>
            </Paper>
          </Grid.Col>
        </Grid>
      </Box>
    </Container>
  );
}
