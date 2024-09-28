import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });

      await customer.save();
    }

    const { accessToken, refreshToken } = generateTokens(customer);
    return reply.send({
      message: customer ? "Login successful" : "Customer created and logged in",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Server side error", error });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
    try {
      const { email, password } = req.body;
      console.log(email, password, "hello");
      
      // Find the delivery partner by email
      let deliveryPartner = await DeliveryPartner.findOne( email ); 
      
      // Check if the delivery partner exists
      if (!deliveryPartner) {
        return reply.status(404).send({ message: "Delivery partner not found" });
      }
      
     
      
      // Compare the input password with the saved password
      const isMatch = password === deliveryPartner.password; 
   
      
      // Check if the password matches
      if (!isMatch) {
        return reply.status(400).send({ message: "Invalid Credentials" });
      }
  
      // Generate tokens after successful login
      const { accessToken, refreshToken } = generateTokens(deliveryPartner);
      return reply.send({
        message: "Login successful",
        accessToken,
        refreshToken,
        deliveryPartner,
      });
    } catch (error) {
      // Handle errors and send a server error response
      return reply.status(500).send({ message: "An error occurred", error });
    }
  };
  

export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    let user;

    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return reply.send({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return reply.status(403).send({ message: "Invalid Refresh token", error });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user; // Assuming the verified token is attached to req.user
    let user;

    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(404).send({ message: "User Not Found" });
    }

    return reply.send({
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An Error Occurred", error });
  }
};
