import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";
import { useAuth } from "../../Context/AuthContext";

const CreateEscrow = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEscrow();
  }, [jobId]);

  const fetchEscrow = async () => {
    try {
      const response = await Api.get(`/escrow/job/${jobId}`);
      setEscrow(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load escrow");
    } finally {
      setLoading(false);
    }
  };

  const initPayment = (data) => {
    // Initialize Razorpay checkout with order details and handle successful payment
    console.log("Order data received:", data);
    const option = {
      key: "rzp_test_S7kwsEHkmNYPso",
      amount: data.amount,
      name: "Freelancer Escrow",
      description: `Payment for Job - ₹${escrow.amount}`,
      currency: data.currency || "INR",
      order_id: data.id,
      handler: async (res) => {
        try {
          // Verify payment signature and update escrow status to funded
          const verifyPayload = {
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
            jobId,
          };

          const { data } = await Api.post("/payment/verify", verifyPayload);

          navigate("/client/dashboard");
        } catch (err) {
          console.error("Payment verification failed:", err);
          console.error("Error response:", err.response?.data);
          console.error("Error status:", err.response?.status);
          setError(
            err.response?.data?.msg ||
              "Payment verification failed. Please try again.",
          );
        }
      },
      theme: {
        color: "3399cc",
      },
    };
    const rzp1 = new window.Razorpay(option);
    rzp1.open();
  };

  const handlePayment = async () => {
    // Create Razorpay order and initiate payment checkout process
    try {
      setPaymentLoading(true);
      setError("");

      if (!escrow?.amount) {
        setError("Invalid escrow amount");
        return;
      }

      // Step 1: Get order from backend
      const response = await Api.post("/payment/order", {
        amount: escrow.amount,
      });
      console.log("Order created:", response.data);

      initPayment(response.data);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.msg || "Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!escrow) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-800 p-6 rounded">
          ❌ No escrow found. Accept a proposal first.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Secure Payment - Escrow</h1>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="border rounded-lg p-8 bg-white shadow-lg">
        <div className="mb-8 pb-6 border-b">
          <p className="text-sm text-gray-600 mb-2">Freelancer</p>
          <p className="text-2xl font-bold">{escrow.freelancerId?.name}</p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Amount to Lock</p>
          <p className="text-5xl font-bold text-blue-600">₹{escrow.amount}</p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">Status</p>
          <p
            className={`text-lg font-semibold ${
              escrow.funded ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {escrow.funded ? "✅ Funded" : "⏳ Pending"}
          </p>
        </div>

        {!escrow.funded ? (
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold text-lg"
          >
            {paymentLoading ? "Processing..." : "💳 Pay Now"}
          </button>
        ) : (
          <div className="bg-green-50 p-6 rounded text-green-800 text-center">
            ✅ Payment locked! Freelancer can start work.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEscrow;
