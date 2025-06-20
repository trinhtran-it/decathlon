import React, { useState, useEffect } from 'react';
import { Container, Title, Grid, Text, Card, Image, Badge, Button, Group, Box, Pagination, Center, Loader } from '@mantine/core';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { Product } from '../types';

export default function HomePage() {
  const router = useRouter();
  const { products, fetchProducts, isLoading, error } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);
  const updateStock = useProductStore((state) => state.updateStock);
  
  // State to track the current product being added to cart
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  
  // Load products on initial render
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 products per page
  
  // Calculate pagination values
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  
  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    // Stop event propagation to prevent navigation when clicking the button
    e.stopPropagation();
    
    console.log('Adding to cart:', product);
    const stockQuantity = product.stock?.quantity || 0;
    console.log('Current stock quantity:', stockQuantity);
    
    if (stockQuantity > 0) {
      try {
        // Set the loading state for this product
        setLoadingProductId(product.id);
        
        // Add to cart first to ensure a good user experience
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          // Make sure image is never undefined
          image: product.image || product.imageUrl || 'https://via.placeholder.com/150'
        };
        
        console.log('Adding item to cart:', cartItem);
        addItem(cartItem);
        
        // Immediately update the local state for smooth UI
        // This is more efficient than calling fetchProducts after the API call
        updateStock(product.id, 1);
        
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
        // Even if the server sync fails, keep the item in cart
        // but inform the user about the issue
        notifications.show({
          title: 'Warning',
          message: `${product.name} was added to your cart but inventory sync failed. Stock information may be inaccurate.`,
          color: 'yellow',
        });
        
        // Try to get just this product's data instead of refreshing all products
        try {
          const fetchedProduct = await useProductStore.getState().fetchProductById(product.id);
          // The product data is automatically updated in the store
        } catch (refreshError) {
          console.error('Failed to refresh product data:', refreshError);
        }
      } finally {
        // Clear the loading state
        setLoadingProductId(null);
      }
    } else {
      console.log('Product is out of stock, cannot add to cart');
      notifications.show({
        title: 'Out of Stock',
        message: `${product.name} is currently out of stock`,
        color: 'yellow',
      });
    }
  };

  // Handle card click to navigate to product detail page
  const handleCardClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <Container size="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Title order={1} mb="lg">Error Loading Products</Title>
        <Text color="red">{error}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={1} mb="lg">Our Products</Title>
      
      {products.length === 0 ? (
        <Text>No products available.</Text>
      ) : (
        <>
          <Box>
            <Grid gutter="lg">
              {currentProducts.map((product) => (
                <Grid.Col key={product.id} span={12} sm={6} md={4} lg={3}>
                  <Card 
                    withBorder 
                    radius="md" 
                    p="md" 
                    style={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      },
                    }}
                    onClick={() => handleCardClick(product.id)}
                  >
                    <Card.Section>
                      <Image src={product.image} height={220} alt={product.name} />
                    </Card.Section>
                    
                    <Group position="apart" mt="md">
                      <Text weight={500}>{product.name}</Text>
                      <Badge 
                        color={product.stock?.quantity && product.stock.quantity > 0 ? 'green' : 'red'} 
                        variant="light"
                      >
                        {product.stock?.quantity && product.stock.quantity > 0 
                          ? `In Stock: ${product.stock.quantity}` 
                          : 'Out of Stock'
                        }
                      </Badge>
                    </Group>
                    
                    <Text size="sm" color="dimmed" mt="sm" style={{ flexGrow: 1 }}>
                      {product.description && product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description}
                    </Text>
                    
                    <Group position="apart" mt="md">
                      <Text size="xl" weight={700}>${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}</Text>
                      <Button 
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAddToCart(e, product)} 
                        disabled={!product.stock?.quantity || product.stock.quantity <= 0 || product.id === loadingProductId}
                        loading={product.id === loadingProductId}
                        sx={{ 
                          minWidth: '110px',  // Set a fixed minimum width to prevent layout shifting
                          height: '36px'      // Set a fixed height
                        }}
                      >
                        {product.id === loadingProductId ? '' : 'Add to cart'}
                      </Button>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Box>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Center mt={40} mb={20}>
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="lg"
                radius="md"
                withEdges
                boundaries={1}
              />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}
