# Image Debugging Guide

## Steps to Debug Image Issues

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for:
- Image load errors
- `Image failed to load:` messages
- Network tab → Check if image requests are being made

### 2. Check API Response
In browser DevTools → Network tab:
- Find `/api/products` or `/api/categories` request
- Check Response → See if `images` array has data
- Example: `{"success": true, "products": [{"_id": "...", "images": ["data:image/..."]}]}`

### 3. Check Database
VPS par run karein:
```bash
# MongoDB shell me connect karein (if installed)
mongosh "your_connection_string"

# Products check karein
use water
db.products.find({}, {name: 1, images: 1}).limit(5)

# Categories check karein
db.categories.find({}, {name: 1, image: 1}).limit(5)
```

### 4. Check Image Format
Images should be:
- Array of strings: `["data:image/svg+xml;base64,...", "http://...", ...]`
- For products: `product.images[0]` should exist
- For categories: `category.image` should be a string

### 5. Test Image URL Directly
Browser me directly image URL paste karein:
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMEVBNUU5Ii8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtbGFzZWxpbmU9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPldhdGVyIFB1cmlmaWVyczwvdGV4dD4KICA8L3N2Zz4=
```

Agar ye load ho jaye, to image format sahi hai.

### 6. Common Issues

**Issue: Images array is empty `[]`**
- Solution: Database me images add karein (seed run karein ya manually add karein)

**Issue: Image URL invalid**
- Check: Image URL `data:image/` se start ho rahi hai ya `http://` se
- SVG format: `data:image/svg+xml;base64,...`

**Issue: CORS errors**
- Check: Browser console me CORS errors
- Solution: Backend CORS config check karein

### 7. Quick Test Commands (VPS)

```bash
# API response check karein
curl http://localhost:5000/api/products?limit=1 | jq '.products[0].images'

# Categories check karein
curl http://localhost:5000/api/categories | jq '.categories[0].image'
```

### 8. Force Rebuild Frontend

```bash
cd ~/WaterJunction/frontend
rm -rf dist node_modules/.vite
npm run build
sudo cp -r dist/* /var/www/waterjunction/
```



## Steps to Debug Image Issues

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for:
- Image load errors
- `Image failed to load:` messages
- Network tab → Check if image requests are being made

### 2. Check API Response
In browser DevTools → Network tab:
- Find `/api/products` or `/api/categories` request
- Check Response → See if `images` array has data
- Example: `{"success": true, "products": [{"_id": "...", "images": ["data:image/..."]}]}`

### 3. Check Database
VPS par run karein:
```bash
# MongoDB shell me connect karein (if installed)
mongosh "your_connection_string"

# Products check karein
use water
db.products.find({}, {name: 1, images: 1}).limit(5)

# Categories check karein
db.categories.find({}, {name: 1, image: 1}).limit(5)
```

### 4. Check Image Format
Images should be:
- Array of strings: `["data:image/svg+xml;base64,...", "http://...", ...]`
- For products: `product.images[0]` should exist
- For categories: `category.image` should be a string

### 5. Test Image URL Directly
Browser me directly image URL paste karein:
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMEVBNUU5Ii8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtbGFzZWxpbmU9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPldhdGVyIFB1cmlmaWVyczwvdGV4dD4KICA8L3N2Zz4=
```

Agar ye load ho jaye, to image format sahi hai.

### 6. Common Issues

**Issue: Images array is empty `[]`**
- Solution: Database me images add karein (seed run karein ya manually add karein)

**Issue: Image URL invalid**
- Check: Image URL `data:image/` se start ho rahi hai ya `http://` se
- SVG format: `data:image/svg+xml;base64,...`

**Issue: CORS errors**
- Check: Browser console me CORS errors
- Solution: Backend CORS config check karein

### 7. Quick Test Commands (VPS)

```bash
# API response check karein
curl http://localhost:5000/api/products?limit=1 | jq '.products[0].images'

# Categories check karein
curl http://localhost:5000/api/categories | jq '.categories[0].image'
```

### 8. Force Rebuild Frontend

```bash
cd ~/WaterJunction/frontend
rm -rf dist node_modules/.vite
npm run build
sudo cp -r dist/* /var/www/waterjunction/
```







