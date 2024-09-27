import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from 'jsonwebtoken';

// Function to generate access and refresh tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET_REFESH,
        { expiresIn: "7d" } 
    );

    return { accessToken, refreshToken }; 
};

