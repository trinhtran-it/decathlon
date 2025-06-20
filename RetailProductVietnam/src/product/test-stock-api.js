// Test script for stock update API
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';
const PRODUCT_ID = '121721252883996'  // Product ID for Running Shoes Pro

// Function to test the stock update API
async function testStockUpdateAPI() {
  try {
    console.log('Testing stock update API...');
    console.log(`Product ID: ${PRODUCT_ID}`);
    
    // First, check current stock
    console.log('\nChecking current stock...');
    const stockResponse = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}`);
    console.log('Current Product with Stock:', JSON.stringify(stockResponse.data, null, 2));
    
    // Update the stock (add 5 units)
    const updateData = { quantity: 5 };
    console.log('\nUpdating stock: Adding 5 units');
    const updateResponse = await axios.put(
      `${API_BASE_URL}/products/${PRODUCT_ID}/stock`,
      updateData
    );
    console.log('Stock Update Response:', JSON.stringify(updateResponse.data, null, 2));
    
    // Check stock after update
    console.log('\nChecking updated stock...');
    const updatedStockResponse = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}`);
    console.log('Updated Product with Stock:', JSON.stringify(updatedStockResponse.data, null, 2));
    
    // Test negative update (subtract 3 units)
    const negativeUpdateData = { quantity: -3 };
    console.log('\nUpdating stock: Subtracting 3 units');
    const negativeUpdateResponse = await axios.put(
      `${API_BASE_URL}/products/${PRODUCT_ID}/stock`,
      negativeUpdateData
    );
    console.log('Negative Stock Update Response:', JSON.stringify(negativeUpdateResponse.data, null, 2));
    
    // Final check
    console.log('\nFinal stock check...');
    const finalStockResponse = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}`);
    console.log('Final Product with Stock:', JSON.stringify(finalStockResponse.data, null, 2));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during API test:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  }
}

// Execute the test
testStockUpdateAPI();
