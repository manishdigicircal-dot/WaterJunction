// Load Razorpay script
(function() {
  // Check if Razorpay is already loaded
  if (window.Razorpay) {
    console.log('Razorpay SDK already loaded');
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = function() {
    console.log('Razorpay SDK loaded successfully');
  };
  script.onerror = function() {
    console.error('Failed to load Razorpay SDK');
  };
  document.head.appendChild(script);
})();










