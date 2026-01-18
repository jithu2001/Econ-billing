#!/bin/bash

# Script to create the first admin user for Trinity Lodge

echo "Creating admin user for Trinity Lodge..."
echo ""
echo "Enter admin username (default: admin):"
read USERNAME
USERNAME=${USERNAME:-admin}

echo "Enter admin password (default: admin123):"
read -s PASSWORD
PASSWORD=${PASSWORD:-admin123}

echo ""
echo "Creating user: $USERNAME"

curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"role\": \"ADMIN\"}"

echo ""
echo ""
echo "Admin user created successfully!"
echo "You can now login with:"
echo "  Username: $USERNAME"
echo "  Password: (your password)"
