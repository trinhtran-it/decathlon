import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Button, Group, Paper, Table, Badge } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { testAddToCart, testRemoveFromCart, runFullTest } from '../utils/testStockSync';

const useStyles = createStyles((theme) => ({
  paper: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  heading: {
    marginBottom: theme.spacing.md,
  },
  table: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  }
}));

export default function TestPage() {
  const { classes } = useStyles();
  const { products, fetchProducts } = useProductStore();
  const { items, clearCart } = useCartStore();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
    
    loadProducts();
  }, [fetchProducts]);
  
  const handleAddToCart = async (productId: string) => {
    setIsLoading(true);
    try {
      const result = await testAddToCart(productId);
      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };
  
  const handleRemoveFromCart = async (productId: string) => {
    setIsLoading(true);
    try {
      const result = await testRemoveFromCart(productId);
      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };
  
  const handleFullTest = async (productId: string) => {
    setIsLoading(true);
    try {
      const results = await runFullTest(productId);
      setTestResults(prev => [...results, ...prev]);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };
  
  const clearTests = () => {
    setTestResults([]);
    clearCart();
  };
  
  return (
    <Container size="xl">
      <Title order={2} className={classes.heading}>Stock Sync Testing</Title>
      
      <Paper className={classes.paper} withBorder>
        <Title order={3} mb="md">Products</Title>
        <Table className={classes.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Current Stock</th>
              <th>In Cart</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const cartItem = items.find(item => item.id === product.id);
              
              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <Badge color={product.stock?.quantity && product.stock.quantity > 0 ? 'green' : 'red'}>
                      {product.stock?.quantity || 0}
                    </Badge>
                  </td>
                  <td>{cartItem?.quantity || 0}</td>
                  <td>
                    <Group>
                      <Button 
                        size="xs" 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isLoading || !product.stock?.quantity || product.stock.quantity <= 0}
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        size="xs" 
                        color="red" 
                        onClick={() => handleRemoveFromCart(product.id)}
                        disabled={isLoading || !cartItem || cartItem.quantity <= 0}
                      >
                        Remove from Cart
                      </Button>
                      <Button 
                        size="xs" 
                        color="grape" 
                        onClick={() => handleFullTest(product.id)}
                        disabled={isLoading || !product.stock?.quantity || product.stock.quantity <= 0}
                      >
                        Run Full Test
                      </Button>
                    </Group>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Paper>
      
      <Paper className={classes.paper} withBorder>
        <Group position="apart">
          <Title order={3}>Test Results</Title>
          <Button color="gray" onClick={clearTests}>Clear Tests</Button>
        </Group>
        
        {testResults.length > 0 ? (
          <Table className={classes.table}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Product ID</th>
                <th>Stock Before → After</th>
                <th>Cart Before → After</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.action}</td>
                  <td>{result.productId}</td>
                  <td>{result.stockBefore} → {result.stockAfter}</td>
                  <td>{result.cartBefore} → {result.cartAfter}</td>
                  <td>
                    <Badge color={result.success ? 'green' : 'red'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Text align="center" mt="xl" color="dimmed">No test results yet</Text>
        )}
      </Paper>
    </Container>
  );
}
