import Razorpay from "razorpay";
import EscrowDB from "../Model/Escrow.js";
import JobDB from "../Model/Job.js";
import crypto from "crypto";

const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZOR_KEY_ID,
      key_secret: process.env.RAZOR_KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await instance.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ msg: "Failed to create order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (
      !jobId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ msg: "Missing payment fields" });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZOR_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.log("❌ Signature mismatch");
      return res.status(400).json({ msg: "Payment not verified" });
    }

    const escrow = await EscrowDB.findOneAndUpdate(
      { jobId },
      { funded: true },
      { new: true },
    );

    if (!escrow) {
      console.log("❌ Escrow not found for jobId:", jobId);
      return res.status(404).json({ msg: "Escrow not found" });
    }

    // ✅ Update job status to in_progress when payment is funded
    await JobDB.findByIdAndUpdate(jobId, { status: "in_progress" });

    res.json({ msg: "Escrow funded successfully", escrow });
  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export default { createOrder, verifyPayment };
