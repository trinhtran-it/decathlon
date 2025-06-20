const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';
const PRODUCT_ID = '121721252883996';  // Product ID for Running Shoes Pro
const NUM_REQUESTS = 50;               // Number of simultaneous requests to simulate
const DELAY_BETWEEN_BATCHES = 500;     // Delay between request batches in ms

// Function to create a single stock update request
async function updateStockRequest(quantity) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/products/${PRODUCT_ID}/stock`,
      { quantity }
    );
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500
    };
  }
}

// Function to run load test
async function runLoadTest() {
  console.log('============================');
  console.log('STARTING LOAD TEST');
  console.log(`Target API: ${API_BASE_URL}/products/${PRODUCT_ID}/stock`);
  console.log(`Number of requests: ${NUM_REQUESTS}`);
  console.log('============================\n');

  // Get initial stock
  try {
    const initialStockResponse = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}`);
    const initialStock = initialStockResponse.data.stock.quantity;
    console.log(`Initial stock: ${initialStock} units`);
    
    // Create request promises in batches
    const batchSize = 10;
    const numBatches = Math.ceil(NUM_REQUESTS / batchSize);
    
    let successCount = 0;
    let failCount = 0;
    let responseTimesMs = [];
    
    for (let i = 0; i < numBatches; i++) {
      const batchPromises = [];
      const batchStart = Date.now();
      
      for (let j = 0; j < Math.min(batchSize, NUM_REQUESTS - i * batchSize); j++) {
        // Alternate between adding 1 and subtracting 1
        const quantity = j % 2 === 0 ? 1 : -1;
        batchPromises.push(updateStockRequest(quantity));
      }
      
      const batchResults = await Promise.all(batchPromises);
      const batchEnd = Date.now();
      
      // Process batch results
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Error: ${JSON.stringify(result.error)}`);
        }
      });
      
      // Calculate response time for this batch
      const batchTime = batchEnd - batchStart;
      responseTimesMs.push(batchTime);
      
      console.log(`Batch ${i+1}/${numBatches} completed. Time: ${batchTime}ms`);
      
      // Add delay between batches (except for last batch)
      if (i < numBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Get final stock
    const finalStockResponse = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}`);
    const finalStock = finalStockResponse.data.stock.quantity;
    
    // Calculate statistics
    const avgResponseTime = responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length;
    const maxResponseTime = Math.max(...responseTimesMs);
    const minResponseTime = Math.min(...responseTimesMs);
    
    // Print test summary
    console.log('\n============================');
    console.log('LOAD TEST RESULTS');
    console.log('============================');
    console.log(`Successful requests: ${successCount}/${NUM_REQUESTS} (${Math.round(successCount/NUM_REQUESTS*100)}%)`);
    console.log(`Failed requests: ${failCount}/${NUM_REQUESTS} (${Math.round(failCount/NUM_REQUESTS*100)}%)`);
    console.log(`Initial stock: ${initialStock} units`);
    console.log(`Final stock: ${finalStock} units`);
    console.log(`Stock change: ${finalStock - initialStock} units`);
    console.log('\nResponse time statistics:');
    console.log(`  Min: ${minResponseTime}ms`);
    console.log(`  Avg: ${Math.round(avgResponseTime)}ms`);
    console.log(`  Max: ${maxResponseTime}ms`);
    console.log('============================');
    
  } catch (error) {
    console.error('Error during load test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Execute the load test
runLoadTest();
