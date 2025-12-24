import axios from 'axios';

const SHIPMOZO_BASE_URL = process.env.SHIPMOZO_BASE_URL || 'https://api.shipmozo.com';
const SHIPMOZO_PUBLIC_KEY = process.env.SHIPMOZO_PUBLIC_KEY;
const SHIPMOZO_PRIVATE_KEY = process.env.SHIPMOZO_PRIVATE_KEY;

/**
 * Shipmozo API Service
 * Handles all Shipmozo API interactions
 */
class ShipmozoService {
  constructor() {
    this.baseURL = SHIPMOZO_BASE_URL;
    this.publicKey = SHIPMOZO_PUBLIC_KEY;
    this.privateKey = SHIPMOZO_PRIVATE_KEY;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    if (!this.publicKey || !this.privateKey) {
      throw new Error('Shipmozo API keys are not configured');
    }

    return {
      'Content-Type': 'application/json',
      'X-Public-Key': this.publicKey,
      'X-Private-Key': this.privateKey
    };
  }

  /**
   * Create shipment order in Shipmozo
   * @param {Object} orderData - Order data from our system
   * @returns {Promise<Object>} Shipmozo response with AWB and tracking info
   */
  async createShipment(orderData) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      const { order, user } = orderData;

      // Prepare shipment payload based on Shipmozo API structure
      const shipmentPayload = {
        order_id: order.orderNumber,
        order_date: new Date().toISOString(),
        payment_mode: order.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
        customer_name: order.shippingAddress.name,
        customer_phone: order.shippingAddress.phone,
        customer_email: user.email || '',
        address_line1: order.shippingAddress.addressLine1,
        address_line2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        country: order.shippingAddress.country || 'India',
        order_amount: order.total,
        cod_amount: order.paymentStatus === 'paid' ? 0 : order.total,
        items: order.items.map((item) => ({
          name: item.name,
          sku: item.product?.toString() || '',
          quantity: item.quantity,
          price: item.price
        })),
        weight: order.items.length * 0.5, // Default weight calculation (can be improved)
        product_type: 'Standard'
      };

      const response = await axios.post(
        `${this.baseURL}/v1/orders/create`,
        shipmentPayload,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          awb: response.data.data?.awb || response.data.awb,
          courier_name: response.data.data?.courier_name || response.data.courier_name,
          tracking_url: response.data.data?.tracking_url || response.data.tracking_url,
          shipment_id: response.data.data?.shipment_id || response.data.shipment_id,
          status: response.data.data?.status || 'created'
        };
      }

      throw new Error(response.data.message || 'Failed to create shipment');
    } catch (error) {
      console.error('Shipmozo createShipment error:', error.response?.data || error.message);
      
      // Return error details for logging
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }

  /**
   * Track shipment using AWB number
   * @param {String} awb - AWB number
   * @returns {Promise<Object>} Tracking information
   */
  async trackShipment(awb) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      if (!awb) {
        throw new Error('AWB number is required');
      }

      const response = await axios.get(
        `${this.baseURL}/v1/track/${awb}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000
        }
      );

      if (response.data && response.data.success) {
        const trackingData = response.data.data || response.data;
        return {
          success: true,
          awb: trackingData.awb || awb,
          status: trackingData.status || trackingData.current_status || 'unknown',
          courier_name: trackingData.courier_name || trackingData.courier,
          tracking_url: trackingData.tracking_url || trackingData.url,
          events: trackingData.events || trackingData.tracking_history || [],
          estimated_delivery: trackingData.estimated_delivery,
          current_location: trackingData.current_location || trackingData.location
        };
      }

      throw new Error(response.data.message || 'Failed to fetch tracking information');
    } catch (error) {
      console.error('Shipmozo trackShipment error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }

  /**
   * Cancel shipment
   * @param {String} awb - AWB number
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelShipment(awb) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/v1/orders/cancel`,
        { awb },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Shipment cancelled successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to cancel shipment');
    } catch (error) {
      console.error('Shipmozo cancelShipment error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }
}

// Export singleton instance
export default new ShipmozoService();


const SHIPMOZO_BASE_URL = process.env.SHIPMOZO_BASE_URL || 'https://api.shipmozo.com';
const SHIPMOZO_PUBLIC_KEY = process.env.SHIPMOZO_PUBLIC_KEY;
const SHIPMOZO_PRIVATE_KEY = process.env.SHIPMOZO_PRIVATE_KEY;

/**
 * Shipmozo API Service
 * Handles all Shipmozo API interactions
 */
class ShipmozoService {
  constructor() {
    this.baseURL = SHIPMOZO_BASE_URL;
    this.publicKey = SHIPMOZO_PUBLIC_KEY;
    this.privateKey = SHIPMOZO_PRIVATE_KEY;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    if (!this.publicKey || !this.privateKey) {
      throw new Error('Shipmozo API keys are not configured');
    }

    return {
      'Content-Type': 'application/json',
      'X-Public-Key': this.publicKey,
      'X-Private-Key': this.privateKey
    };
  }

  /**
   * Create shipment order in Shipmozo
   * @param {Object} orderData - Order data from our system
   * @returns {Promise<Object>} Shipmozo response with AWB and tracking info
   */
  async createShipment(orderData) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      const { order, user } = orderData;

      // Prepare shipment payload based on Shipmozo API structure
      const shipmentPayload = {
        order_id: order.orderNumber,
        order_date: new Date().toISOString(),
        payment_mode: order.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
        customer_name: order.shippingAddress.name,
        customer_phone: order.shippingAddress.phone,
        customer_email: user.email || '',
        address_line1: order.shippingAddress.addressLine1,
        address_line2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        country: order.shippingAddress.country || 'India',
        order_amount: order.total,
        cod_amount: order.paymentStatus === 'paid' ? 0 : order.total,
        items: order.items.map((item) => ({
          name: item.name,
          sku: item.product?.toString() || '',
          quantity: item.quantity,
          price: item.price
        })),
        weight: order.items.length * 0.5, // Default weight calculation (can be improved)
        product_type: 'Standard'
      };

      const response = await axios.post(
        `${this.baseURL}/v1/orders/create`,
        shipmentPayload,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          awb: response.data.data?.awb || response.data.awb,
          courier_name: response.data.data?.courier_name || response.data.courier_name,
          tracking_url: response.data.data?.tracking_url || response.data.tracking_url,
          shipment_id: response.data.data?.shipment_id || response.data.shipment_id,
          status: response.data.data?.status || 'created'
        };
      }

      throw new Error(response.data.message || 'Failed to create shipment');
    } catch (error) {
      console.error('Shipmozo createShipment error:', error.response?.data || error.message);
      
      // Return error details for logging
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }

  /**
   * Track shipment using AWB number
   * @param {String} awb - AWB number
   * @returns {Promise<Object>} Tracking information
   */
  async trackShipment(awb) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      if (!awb) {
        throw new Error('AWB number is required');
      }

      const response = await axios.get(
        `${this.baseURL}/v1/track/${awb}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000
        }
      );

      if (response.data && response.data.success) {
        const trackingData = response.data.data || response.data;
        return {
          success: true,
          awb: trackingData.awb || awb,
          status: trackingData.status || trackingData.current_status || 'unknown',
          courier_name: trackingData.courier_name || trackingData.courier,
          tracking_url: trackingData.tracking_url || trackingData.url,
          events: trackingData.events || trackingData.tracking_history || [],
          estimated_delivery: trackingData.estimated_delivery,
          current_location: trackingData.current_location || trackingData.location
        };
      }

      throw new Error(response.data.message || 'Failed to fetch tracking information');
    } catch (error) {
      console.error('Shipmozo trackShipment error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }

  /**
   * Cancel shipment
   * @param {String} awb - AWB number
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelShipment(awb) {
    try {
      if (!this.publicKey || !this.privateKey) {
        throw new Error('Shipmozo API keys are not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/v1/orders/cancel`,
        { awb },
        {
          headers: this.getAuthHeaders(),
          timeout: 30000
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Shipment cancelled successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to cancel shipment');
    } catch (error) {
      console.error('Shipmozo cancelShipment error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        statusCode: error.response?.status || 500
      };
    }
  }
}

// Export singleton instance
export default new ShipmozoService();


