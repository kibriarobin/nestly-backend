import axios from "axios";
import qs from "qs";
import config from "../../config";

const SSL_BASE_URL = config.ssl_is_live
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const initiatePayment = async (paymentData: {
  amount: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}) => {
  const data = {
    store_id: config.ssl_store_id,
    store_passwd: config.ssl_store_password,
    total_amount: paymentData.amount,
    currency: "BDT",
    tran_id: paymentData.transactionId,
    success_url: `${config.ssl_success_url}?tran_id=${paymentData.transactionId}`,
    fail_url: `${config.ssl_fail_url}?tran_id=${paymentData.transactionId}`,
    cancel_url: `${config.ssl_cancel_url}?tran_id=${paymentData.transactionId}`,
    cus_name: paymentData.customerName,
    cus_email: paymentData.customerEmail,
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_postcode: "N/A",
    cus_country: "Bangladesh",
    cus_phone: paymentData.customerPhone ?? "N/A",
    shipping_method: "NO",
    product_name: "Room/Flat Booking",
    product_category: "Rental",
    product_profile: "general",
  };

  const response = await axios({
    method: "POST",
    url: `${SSL_BASE_URL}/gwprocess/v4/api.php`,
    data: qs.stringify(data),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
};

const validatePayment = async (val_id: string) => {
  const response = await axios.get(
    `${SSL_BASE_URL}/validator/api/validationserverAPI.php`,
    {
      params: {
        val_id,
        store_id: config.ssl_store_id,
        store_passwd: config.ssl_store_password,
        format: "json",
      },
    },
  );

  return response.data;
};

export const sslCommerzUtils = {
  initiatePayment,
  validatePayment,
};