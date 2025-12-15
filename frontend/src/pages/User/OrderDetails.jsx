import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-12 text-center">Order not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <FiPrinter />
          <span>Print Invoice</span>
        </button>
      </div>
      
      <div ref={printRef} className="bg-white print-invoice-container">
        {/* Watermark Background - Only visible when printing */}
        <div className="print-only print-watermark">
          <img 
            src="/images/logo-waterjuction.webp" 
            alt="Water Junction Logo" 
            className="print-watermark-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Invoice Container with proper margins */}
        <div className="print-invoice-content">
          {/* Invoice Header - Only visible when printing */}
          <div className="print-only print-invoice-header">
            <div className="print-header-top">
              <div className="print-company-info">
                <img 
                  src="/images/logo-waterjuction.webp" 
                  alt="Water Junction" 
                  className="print-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="print-company-details">
                  <h1 className="print-company-name">Water Junction</h1>
                  <p className="print-company-tagline">Pure Water, Pure Life</p>
                  <div className="print-company-address">
                    <p>Ground Floor, Khasra No - 146, Dudeshwar Enclave</p>
                    <p>Vill - Chipiana Tigri, Opposite - 14th Avenue</p>
                    <p>Gaur City, Gautam Buddha Nagar, Uttar Pradesh, 201301</p>
                    <p>Email: waterjunction514@gmail.com | Phone: +91 9560121045</p>
                  </div>
                </div>
              </div>
              <div className="print-invoice-title">
                <h2 className="print-invoice-title-text">TAX INVOICE</h2>
                <div className="print-invoice-number">
                  <span className="print-invoice-label">Invoice #:</span>
                  <span className="print-invoice-value">{order.orderNumber}</span>
                </div>
              </div>
            </div>

            <div className="print-header-bottom">
              <div className="print-bill-to">
                <h3 className="print-section-title">Bill To:</h3>
                <div className="print-address-block">
                  <p className="print-address-name">{order.shippingAddress.name}</p>
                  <p className="print-address-line">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="print-address-line">{order.shippingAddress.addressLine2}</p>
                  )}
                  <p className="print-address-line">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="print-address-line">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
              <div className="print-invoice-details">
                <div className="print-detail-row">
                  <span className="print-detail-label">Invoice Date:</span>
                  <span className="print-detail-value">{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                </div>
                <div className="print-detail-row">
                  <span className="print-detail-label">Order Date:</span>
                  <span className="print-detail-value">{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                </div>
                <div className="print-detail-row">
                  <span className="print-detail-label">Status:</span>
                  <span className="print-detail-value">{order.status.toUpperCase()}</span>
                </div>
                {order.trackingNumber && (
                  <div className="print-detail-row">
                    <span className="print-detail-label">Tracking #:</span>
                    <span className="print-detail-value">{order.trackingNumber}</span>
                  </div>
                )}
                <div className="print-detail-row">
                  <span className="print-detail-label">Payment Method:</span>
                  <span className="print-detail-value">{order.paymentMethod?.toUpperCase() || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table - Print View */}
          <div className="print-only print-items-section">
            <table className="print-items-table">
              <thead>
                <tr>
                  <th className="print-col-sno">S.No</th>
                  <th className="print-col-item">Item Description</th>
                  <th className="print-col-qty">Qty</th>
                  <th className="print-col-price">Unit Price</th>
                  <th className="print-col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="print-col-sno">{idx + 1}</td>
                    <td className="print-col-item">
                      <div className="print-item-name">{item.name}</div>
                      {item.product?.sku && (
                        <div className="print-item-sku">SKU: {item.product.sku}</div>
                      )}
                    </td>
                    <td className="print-col-qty">{item.quantity}</td>
                    <td className="print-col-price">₹{item.price.toLocaleString()}</td>
                    <td className="print-col-total">₹{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary - Print View */}
          <div className="print-only print-summary-section">
            <div className="print-summary-table">
              <div className="print-summary-row">
                <span className="print-summary-label">Subtotal:</span>
                <span className="print-summary-value">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="print-summary-row">
                <span className="print-summary-label">Shipping:</span>
                <span className="print-summary-value">{order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString()}`}</span>
              </div>
              <div className="print-summary-row">
                <span className="print-summary-label">Tax (GST):</span>
                <span className="print-summary-value">₹{order.tax.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="print-summary-row print-discount-row">
                  <span className="print-summary-label">Discount:</span>
                  <span className="print-summary-value">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="print-summary-row print-total-row">
                <span className="print-summary-label">Grand Total:</span>
                <span className="print-summary-value">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="print-only print-invoice-footer">
            <div className="print-footer-content">
              <p className="print-footer-thanks">Thank you for your business!</p>
              <p className="print-footer-tagline">Water Junction - Pure Water, Pure Life</p>
              <p className="print-footer-contact">
                Email: waterjunction514@gmail.com | Phone: +91 9560121045
              </p>
              <p className="print-footer-note">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </div>

        {/* Regular View (Non-Print) */}
        <div className="no-print">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{item.name}</p>
                        <p className="text-gray-600">
                          Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-lg">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="text-gray-700">
                  <p className="font-semibold">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Order Number</span>
                    <span className="font-semibold">#{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date</span>
                    <span>{format(new Date(order.createdAt), 'PPp')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{order.tax.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Hide print-only elements on screen */
        .print-only {
          display: none;
        }

        /* Show no-print elements on screen */
        .no-print {
          display: block;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm 12mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .print-invoice-container,
          .print-invoice-container * {
            visibility: visible !important;
          }

          .print-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            min-height: 100vh;
            padding: 0;
            margin: 0;
          }

          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: 0;
            pointer-events: none;
            visibility: visible !important;
          }

          .print-watermark-img {
            width: 600px;
            height: 600px;
            object-fit: contain;
          }

          .print-invoice-content {
            position: relative;
            z-index: 1;
            padding: 0;
            max-width: 100%;
            margin: 0;
            visibility: visible !important;
          }

          .print-invoice-header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1e40af;
            visibility: visible !important;
            display: block !important;
          }

          .print-header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .print-company-info {
            display: flex;
            gap: 15px;
            flex: 1;
          }

          .print-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
          }

          .print-company-details {
            flex: 1;
          }

          .print-company-name {
            font-size: 28px;
            font-weight: 800;
            color: #1e40af;
            margin: 0 0 5px 0;
            line-height: 1.2;
          }

          .print-company-tagline {
            font-size: 14px;
            color: #06b6d4;
            margin: 0 0 10px 0;
            font-weight: 600;
          }

          .print-company-address {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.6;
            margin: 0;
          }

          .print-company-address p {
            margin: 2px 0;
          }

          .print-invoice-title {
            text-align: right;
          }

          .print-invoice-title-text {
            font-size: 32px;
            font-weight: 900;
            color: #1e40af;
            margin: 0 0 10px 0;
            letter-spacing: 2px;
          }

          .print-invoice-number {
            background: #1e40af;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            display: inline-block;
          }

          .print-invoice-label {
            font-size: 12px;
            margin-right: 8px;
          }

          .print-invoice-value {
            font-size: 16px;
            font-weight: 700;
          }

          .print-header-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 20px;
          }

          .print-bill-to,
          .print-invoice-details {
            font-size: 12px;
          }

          .print-section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e40af;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .print-address-block {
            line-height: 1.8;
          }

          .print-address-name {
            font-weight: 700;
            color: #111827;
            margin: 0 0 5px 0;
            font-size: 13px;
          }

          .print-address-line {
            color: #4b5563;
            margin: 2px 0;
          }

          .print-detail-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dotted #d1d5db;
          }

          .print-detail-row:last-child {
            border-bottom: none;
          }

          .print-detail-label {
            font-weight: 600;
            color: #6b7280;
          }

          .print-detail-value {
            font-weight: 700;
            color: #111827;
          }

          .print-items-section {
            margin: 30px 0;
            visibility: visible !important;
            display: block !important;
          }

          .print-items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          .print-items-table thead {
            background: #1e40af;
            color: white;
          }

          .print-items-table th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #1e3a8a;
          }

          .print-items-table td {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
          }

          .print-items-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }

          .print-col-sno {
            width: 5%;
            text-align: center;
          }

          .print-col-item {
            width: 45%;
          }

          .print-col-qty {
            width: 10%;
            text-align: center;
          }

          .print-col-price {
            width: 20%;
            text-align: right;
          }

          .print-col-total {
            width: 20%;
            text-align: right;
            font-weight: 700;
          }

          .print-item-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 3px;
          }

          .print-item-sku {
            font-size: 10px;
            color: #6b7280;
          }

          .print-summary-section {
            margin-top: 30px;
            display: flex !important;
            justify-content: flex-end;
            visibility: visible !important;
          }

          .print-summary-table {
            width: 300px;
            border: 2px solid #1e40af;
            border-radius: 5px;
            overflow: hidden;
          }

          .print-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
          }

          .print-summary-row:last-child {
            border-bottom: none;
          }

          .print-summary-label {
            font-weight: 600;
            color: #4b5563;
          }

          .print-summary-value {
            font-weight: 700;
            color: #111827;
          }

          .print-discount-row {
            background: #f0fdf4;
            color: #16a34a;
          }

          .print-total-row {
            background: #1e40af;
            color: white;
            font-size: 16px;
            font-weight: 800;
          }

          .print-total-row .print\\:summary-label,
          .print-total-row .print\\:summary-value {
            color: white;
          }

          .print-invoice-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            visibility: visible !important;
            display: block !important;
          }

          .print-footer-content {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.8;
          }

          .print-footer-thanks {
            font-size: 14px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
          }

          .print-footer-tagline {
            font-size: 12px;
            font-weight: 600;
            color: #06b6d4;
            margin: 5px 0;
          }

          .print-footer-contact {
            margin: 5px 0;
          }

          .print-footer-note {
            margin-top: 15px;
            font-style: italic;
            color: #9ca3af;
          }

          /* Hide everything except invoice */
          #root > *:not(.print-invoice-container) {
            visibility: hidden;
            display: none;
          }

          /* Show print-only elements */
          .print-only {
            display: block !important;
            visibility: visible !important;
          }

          /* Hide no-print elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          /* Make sure print content shows */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }

            #root {
              margin: 0;
              padding: 0;
            }

            .print-invoice-container {
              display: block !important;
            }

            .print-invoice-container * {
              visibility: visible !important;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;
