# Shipmozo Integration Guide

This document describes the Shipmozo shipping integration implemented in the WaterJunction e-commerce platform.

## Overview

Shipmozo is integrated as a shipping partner to automatically create shipments when orders are placed and provide tracking capabilities.

## Backend Implementation

### 1. Service Layer

**File:** `backend/services/shipmozoService.js`

A dedicated service class handles all Shipmozo API interactions:
- `createShipment()` - Creates a shipment in Shipmozo system
- `trackShipment(awb)` - Tracks shipment status using AWB number
- `cancelShipment(awb)` - Cancels a shipment (if needed)

### 2. Database Schema Updates

**File:** `backend/models/Order.js`

The Order schema has been extended with the following fields:
- `shipmozoAwb` (String) - Airway Bill number from Shipmozo
- `courierName` (String) - Name of the courier partner
- `trackingUrl` (String) - Direct tracking URL
- `shipmentStatus` (String) - Current shipment status (created, in_transit, delivered, etc.)
- `shippingPending` (Boolean) - Flag to indicate if shipment creation is pending

### 3. Order Flow Integration

**File:** `backend/routes/orderRoutes.js`

#### Automatic Shipment Creation
When a payment is verified successfully (`POST /api/orders/verify-payment`):
1. Order is marked as paid
2. Product stock is updated
3. Shipmozo API is called to create shipment
4. If successful: AWB, courier name, tracking URL, and status are saved
5. If failed: Order is still saved with `shippingPending: true`

#### API Endpoints

**GET /api/orders/:id/track** (Private)
- Tracks shipment using AWB number
- Updates order status based on shipment status
- Returns tracking information and history

**POST /api/orders/:id/create-shipment** (Admin only)
- Manually creates shipment for an order
- Useful for retry scenarios

### 4. Environment Variables

Add these to your `backend/.env` file:

```env
SHIPMOZO_PUBLIC_KEY=your_public_key_here
SHIPMOZO_PRIVATE_KEY=your_private_key_here
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

**IMPORTANT:** Never expose these keys in the frontend code.

## Frontend Implementation

### 1. Admin Panel

**File:** `frontend/src/pages/Admin/Orders.jsx`

- Added "Tracking" column in orders table
- Displays AWB number, courier name, and shipment status
- Shows "Pending" indicator for orders with `shippingPending: true`

### 2. Customer Order Details

**File:** `frontend/src/pages/User/OrderDetails.jsx`

- Added "Track Order" button
- Displays AWB number, courier name, tracking status
- Shows tracking history with events
- Provides link to courier's tracking website
- Refresh button to update tracking information

## Payment Modes

Both COD (Cash on Delivery) and Prepaid orders are supported:

- **Prepaid:** `cod_amount` is set to 0
- **COD:** `cod_amount` equals order total

The payment mode is determined by `order.paymentStatus`:
- `paymentStatus === 'paid'` → Prepaid
- `paymentStatus !== 'paid'` → COD

## Error Handling

### Shipmozo API Failures

If Shipmozo API fails during order creation:
- Order is still saved successfully
- `shippingPending` flag is set to `true`
- Order status remains as `paid`
- Admin can manually create shipment later using the create-shipment endpoint

### Tracking Failures

If tracking API fails:
- Current stored tracking information is returned
- Error message is shown to user
- Order status is not affected

## Shipment Status Mapping

Shipment statuses from Shipmozo are mapped to order statuses:

- `created` → Order remains `paid` or `packed`
- `in_transit` → Order status updated to `shipped`
- `delivered` → Order status updated to `delivered`, `deliveredAt` timestamp set
- `rto` / `returned` → Order status updated to `returned`
- `cancelled` → Order status updated to `cancelled`

## Testing

1. **Create a test order** with payment verification
2. **Check order object** - should have `shipmozoAwb` if Shipmozo API succeeded
3. **Check tracking** - use the Track Order button to verify tracking works
4. **Test error scenarios** - disable Shipmozo keys to test fallback behavior

## API Response Format

### Create Shipment Response

```json
{
  "success": true,
  "awb": "SHIPMOZO123456",
  "courier_name": "FedEx",
  "tracking_url": "https://fedex.com/track/SHIPMOZO123456",
  "shipment_id": "ship_123",
  "status": "created"
}
```

### Track Shipment Response

```json
{
  "success": true,
  "tracking": {
    "awb": "SHIPMOZO123456",
    "status": "in_transit",
    "courier_name": "FedEx",
    "tracking_url": "https://fedex.com/track/SHIPMOZO123456",
    "events": [
      {
        "status": "Picked up",
        "location": "Mumbai",
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ],
    "estimated_delivery": "2024-01-20",
    "current_location": "Delhi"
  },
  "order": {
    "status": "shipped",
    "shipmentStatus": "in_transit"
  }
}
```

## Notes

- Shipmozo API endpoints and response formats may vary. Adjust the service accordingly based on actual API documentation.
- Weight calculation is currently a placeholder (defaults to items.length * 0.5 kg). Update based on actual product weights.
- The integration gracefully handles API failures to ensure orders are always saved.


This document describes the Shipmozo shipping integration implemented in the WaterJunction e-commerce platform.

## Overview

Shipmozo is integrated as a shipping partner to automatically create shipments when orders are placed and provide tracking capabilities.

## Backend Implementation

### 1. Service Layer

**File:** `backend/services/shipmozoService.js`

A dedicated service class handles all Shipmozo API interactions:
- `createShipment()` - Creates a shipment in Shipmozo system
- `trackShipment(awb)` - Tracks shipment status using AWB number
- `cancelShipment(awb)` - Cancels a shipment (if needed)

### 2. Database Schema Updates

**File:** `backend/models/Order.js`

The Order schema has been extended with the following fields:
- `shipmozoAwb` (String) - Airway Bill number from Shipmozo
- `courierName` (String) - Name of the courier partner
- `trackingUrl` (String) - Direct tracking URL
- `shipmentStatus` (String) - Current shipment status (created, in_transit, delivered, etc.)
- `shippingPending` (Boolean) - Flag to indicate if shipment creation is pending

### 3. Order Flow Integration

**File:** `backend/routes/orderRoutes.js`

#### Automatic Shipment Creation
When a payment is verified successfully (`POST /api/orders/verify-payment`):
1. Order is marked as paid
2. Product stock is updated
3. Shipmozo API is called to create shipment
4. If successful: AWB, courier name, tracking URL, and status are saved
5. If failed: Order is still saved with `shippingPending: true`

#### API Endpoints

**GET /api/orders/:id/track** (Private)
- Tracks shipment using AWB number
- Updates order status based on shipment status
- Returns tracking information and history

**POST /api/orders/:id/create-shipment** (Admin only)
- Manually creates shipment for an order
- Useful for retry scenarios

### 4. Environment Variables

Add these to your `backend/.env` file:

```env
SHIPMOZO_PUBLIC_KEY=your_public_key_here
SHIPMOZO_PRIVATE_KEY=your_private_key_here
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

**IMPORTANT:** Never expose these keys in the frontend code.

## Frontend Implementation

### 1. Admin Panel

**File:** `frontend/src/pages/Admin/Orders.jsx`

- Added "Tracking" column in orders table
- Displays AWB number, courier name, and shipment status
- Shows "Pending" indicator for orders with `shippingPending: true`

### 2. Customer Order Details

**File:** `frontend/src/pages/User/OrderDetails.jsx`

- Added "Track Order" button
- Displays AWB number, courier name, tracking status
- Shows tracking history with events
- Provides link to courier's tracking website
- Refresh button to update tracking information

## Payment Modes

Both COD (Cash on Delivery) and Prepaid orders are supported:

- **Prepaid:** `cod_amount` is set to 0
- **COD:** `cod_amount` equals order total

The payment mode is determined by `order.paymentStatus`:
- `paymentStatus === 'paid'` → Prepaid
- `paymentStatus !== 'paid'` → COD

## Error Handling

### Shipmozo API Failures

If Shipmozo API fails during order creation:
- Order is still saved successfully
- `shippingPending` flag is set to `true`
- Order status remains as `paid`
- Admin can manually create shipment later using the create-shipment endpoint

### Tracking Failures

If tracking API fails:
- Current stored tracking information is returned
- Error message is shown to user
- Order status is not affected

## Shipment Status Mapping

Shipment statuses from Shipmozo are mapped to order statuses:

- `created` → Order remains `paid` or `packed`
- `in_transit` → Order status updated to `shipped`
- `delivered` → Order status updated to `delivered`, `deliveredAt` timestamp set
- `rto` / `returned` → Order status updated to `returned`
- `cancelled` → Order status updated to `cancelled`

## Testing

1. **Create a test order** with payment verification
2. **Check order object** - should have `shipmozoAwb` if Shipmozo API succeeded
3. **Check tracking** - use the Track Order button to verify tracking works
4. **Test error scenarios** - disable Shipmozo keys to test fallback behavior

## API Response Format

### Create Shipment Response

```json
{
  "success": true,
  "awb": "SHIPMOZO123456",
  "courier_name": "FedEx",
  "tracking_url": "https://fedex.com/track/SHIPMOZO123456",
  "shipment_id": "ship_123",
  "status": "created"
}
```

### Track Shipment Response

```json
{
  "success": true,
  "tracking": {
    "awb": "SHIPMOZO123456",
    "status": "in_transit",
    "courier_name": "FedEx",
    "tracking_url": "https://fedex.com/track/SHIPMOZO123456",
    "events": [
      {
        "status": "Picked up",
        "location": "Mumbai",
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ],
    "estimated_delivery": "2024-01-20",
    "current_location": "Delhi"
  },
  "order": {
    "status": "shipped",
    "shipmentStatus": "in_transit"
  }
}
```

## Notes

- Shipmozo API endpoints and response formats may vary. Adjust the service accordingly based on actual API documentation.
- Weight calculation is currently a placeholder (defaults to items.length * 0.5 kg). Update based on actual product weights.
- The integration gracefully handles API failures to ensure orders are always saved.




