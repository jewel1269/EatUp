import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Category, Product } from "./src/models/index.js";
import { Categories, Products } from "./seedData.js"; 

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database.");

    // Clear the collections
    await Product.deleteMany({});
    console.log("Product collection cleared.");

    await Category.deleteMany({});
    console.log("Category collection cleared.");

    // Insert categories
    const categoryDocs = await Category.insertMany(Categories);
    console.log("Categories inserted.");

    // Create a map of category names to their IDs
    const categoryMap = categoryDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    // Map products to include category IDs (correcting the field)
    const productWithCategoryIds = Products.map((product) => ({
      ...product,
      category: categoryMap[product.category], 
    }));

    // Insert products
    await Product.insertMany(productWithCategoryIds);
    console.log("Products inserted with category IDs.");
  } catch (error) {
    console.log("Error in SeedDatabase: ", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seedDatabase();
