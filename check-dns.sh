#!/bin/bash

echo "🔍 Checking DNS for beta.tsalin.ai..."
echo ""
echo "DNS Lookup:"
nslookup beta.tsalin.ai
echo ""
echo "Expected IP: 34.107.5.242"
echo ""
echo "Dig results:"
dig +short beta.tsalin.ai
echo ""
echo "Testing HTTP connection:"
curl -I http://beta.tsalin.ai 2>&1 | head -5

