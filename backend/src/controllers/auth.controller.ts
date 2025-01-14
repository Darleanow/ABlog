import { Request, Response } from "express";
import { supabase } from "../config/database";

export class AuthController {
  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return res.json({
        token: data.session.access_token,
        user: data.user,
      });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  async signUp(req: Request, res: Response) {
    try {
      const { email, password, username, full_name } = req.body;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create auth user");

      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const { error: profileError } = await supabase.from("users").insert({
        username,
        email,
        password_hash,
        full_name,
        is_admin: false,
      });

      if (profileError) throw profileError;

      return res.status(201).json({
        message: "User created successfully",
        user: authData.user,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      supabase.auth.setSession({
        access_token: token,
        refresh_token: "",
      });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return res.json({ message: "Signed out successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
