"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/actions/user-actions";
import { UserTable } from "./user-table";
import { CreateUserDialog } from "./create-user-dialog";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";
import { Users } from "lucide-react";

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.error) {
      toast.error(result.error);
    } else {
      setUsers(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-6 px-8 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
              <Users className="h-7 w-7" />
              {t("systemUsers")}
            </h2>
            <p className="text-gray-200 dark:text-gray-300 mt-2 text-sm">
              Manage access and permissions for team members
            </p>
          </div>
          <div className="flex-shrink-0">
            <CreateUserDialog onUserCreated={fetchUsers} />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <UserTable users={users} onRefresh={fetchUsers} />
        )}
      </div>
    </div>
  );
}
