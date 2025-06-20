#!/bin/bash
# Stock API Testing Script

echo "RetailProductVietnam Stock API Test Script"
echo "=========================================="
echo

function show_help {
  echo "Usage: ./test-stock-api.sh [OPTION]"
  echo
  echo "Options:"
  echo "  basic     Run basic functionality test"
  echo "  load      Run load/stress test"
  echo "  all       Run all tests"
  echo "  help      Show this help message"
  echo
}

function run_basic_test {
  echo "Running basic functionality test..."
  node src/product/test-stock-api.js
}

function run_load_test {
  echo "Running load/stress test..."
  node src/product/load-test-stock-api.js
}

# Process arguments
case "$1" in
  basic)
    run_basic_test
    ;;
  load)
    run_load_test
    ;;
  all)
    run_basic_test
    echo
    echo "------------------------------------------------"
    echo
    run_load_test
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown option: $1"
    echo
    show_help
    exit 1
    ;;
esac
