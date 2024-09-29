import { Order } from "../../models/order.js";
import { Branch } from "../../models/branch.js";
import { Customer, DeliveryPartner } from "../../models/user.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    if (!branchData) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation?.latitude || 0,
        longitude: customerData.liveLocation?.longitude || 0,
        address: customerData.address || "No Address Available",
      },
      pickupLocation: {
        latitude: branchData.location?.latitude || 0,
        longitude: branchData.location?.longitude || 0,
        address: branchData.address || "No Address Available",
      },
    });

    const savedOrder = await newOrder.save();
    return reply.status(201).send(savedOrder);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to create Order", error });
  }
};

export const confirmedOrder = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery person not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    if (order.status !== "available") {
      return reply.status(400).send({ message: "Order is not available" });
    }

    order.status = "confirmed";
    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude || 0,
      longitude: deliveryPersonLocation?.longitude || 0,
      address: deliveryPersonLocation?.address || "No Address Available",
    };

    req.server.io.to(orderId).emit("orderConfirmed", order)

    await order.save();
    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to confirm Order", error });
  }
};

export const updateOrderStatus = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery person not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "Order cannot be updated" });
    }

    if (order.deliveryPartner.toString() !== userId) {
      return reply.status(403).send({ message: "Unauthorized" });
    }

    order.status = status;
    order.deliveryPersonLocation = deliveryPersonLocation;

    await order.save();

    req.server.io.to(orderId).emit("liveTreackingUpdate", order)
    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to update Order status", error });
  }
};

export const getOrder = async (req, reply) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
    }
    if (branchId) {
      query.branch = branchId;
    }

    const orders = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );

    return reply.send(orders);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to retrieve Orders", error });
  }
};

export const getOrderById = async (req, reply) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryPartner"
    );

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Failed to retrieve Order", error });
  }
};
