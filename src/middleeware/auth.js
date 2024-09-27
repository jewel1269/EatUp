import jwt from "jsonwebtoken";

export const verifyToken = async (req, reply) => {
  try {
   
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return reply.status(401).send({ message: "Token not provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

   return true
  } catch (error) {
    return reply.status(403).send({ message: "Invalid or expired token" });
  }
};


