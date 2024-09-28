import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, reply) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    // Find the user, first check in Customer, then DeliveryPartner
    let user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));

    // If user is not found, return 404
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // Determine which model to use based on the user's role
    let UserModel;
    if (user.role === "Customer") {
      UserModel = Customer;
    } else if (user.role === "DeliveryPartner") {
      UserModel = DeliveryPartner;
    } else {
      return reply.status(400).send({ message: "Invalid User Role" });
    }

    // Update the user data
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If the user couldn't be updated, return an error
    if (!updatedUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    // Respond with the updated user
    return reply.send({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // Handle any errors
    return reply.status(500).send({ message: "Failed to update user", error });
  }
};
