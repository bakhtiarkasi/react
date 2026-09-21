//custom defined user roles in my app
export type UserRole = "admin" | "collector" | "support" | "tenant";

//each user profile is described the following properties
export type UserProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};
