#!/bin/bash
# Quick test after Google Cloud setup
echo "🧪 Testing Google Maps APIs after setup..."
echo "============================================="

API_KEY="AIzaSyDyYgbHd5YbRVVNacAperI2PJdKHawJXSU"

# Test 1: JavaScript API
echo "1. Testing Maps JavaScript API..."
JS_STATUS=$(curl -s -I "https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=test" \
  -H "Referer: http://localhost:5174/" | grep "HTTP/" | awk '{print $2}')

if [ "$JS_STATUS" = "200" ]; then
    echo "   ✅ Maps JavaScript API is working!"
else
    echo "   ❌ Maps JavaScript API status: $JS_STATUS (should be 200)"
fi

# Test 2: Places API
echo "2. Testing Places API..."
PLACES_RESULT=$(curl -s "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Delhi&key=${API_KEY}" \
  -H "Referer: http://localhost:5174/")
PLACES_STATUS=$(echo "$PLACES_RESULT" | grep -o '"status"[^,]*' | cut -d'"' -f4)

if [ "$PLACES_STATUS" = "OK" ]; then
    echo "   ✅ Places API is working!"
    echo ""
    echo "🎉 SUCCESS! Your EVBharat map should work now!"
    echo "📍 Go to: http://localhost:5174/map"
elif [ "$PLACES_STATUS" = "REQUEST_DENIED" ]; then
    ERROR_MSG=$(echo "$PLACES_RESULT" | grep -o '"error_message"[^}]*' | cut -d'"' -f4)
    echo "   ❌ Still denied: $ERROR_MSG"
    echo ""
    echo "💡 Make sure you enabled 'Places API' (not legacy) in console"
else
    echo "   ⚠️  Status: $PLACES_STATUS"
fi
echo ""