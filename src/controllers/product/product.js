import { Product } from "../../models/product.js";

export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;
  console.log(categoryId);

  try {
    // Use find to get all products under the given categoryId
    const products = await Product.find({ category: categoryId })
      .select("-category") 
      .exec();

    

    return reply.send(products); 
    
  } catch (error) {
    // Handle errors and send a server error response
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
