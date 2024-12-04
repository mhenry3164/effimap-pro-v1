#!/bin/bash

# Install frontend dependencies
npm install @stripe/stripe-js date-fns

# Install Firebase Functions dependencies
cd functions
npm install stripe
cd ..
