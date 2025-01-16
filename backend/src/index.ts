import app from "./app";
import { supabase } from "./config/database";

const PORT = process.env.PORT ?? 3000;

const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .single();
    if (error) throw error;
    console.log("Successfully connected to Supabase");
    console.log(`Current user count: ${data.count}`);
  } catch (error) {
    console.error("Error connecting to Supabase:", error);
    process.exit(1);
  }
};

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
