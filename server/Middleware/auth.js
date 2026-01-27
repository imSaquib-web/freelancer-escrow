import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "TOKEN NOT FOUND" }); // 401 = Unauthorized
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    res.status(500).json({ msg: "TOKEN invalid" });
  }
};

export const isClient = (req, res, next) => {
  if (req.user.role !== "client")
    return res.status(403).json({ msg: "Client only" });
  next();
};

export const isFreelancer = (req, res, next) => {
  if (req.user.role !== "freelancer")
    return res.status(403).json({ msg: "Freelancer only" });
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Admin only" });
  next();
};
