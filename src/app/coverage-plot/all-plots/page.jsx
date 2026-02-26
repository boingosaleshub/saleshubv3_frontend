"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/components/providers/language-provider";
import { PlotsTable } from "@/components/coverage-plot/plots-table";
import { Loader2, Layers } from "lucide-react";

export default function AllPlotsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuthStore();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    // Check if user is admin or super admin
    const userRole = user?.app_metadata?.role;
    const isAdmin = ["Admin", "Super Admin"].includes(userRole);
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchAllPlots();
    // Only re-run when user id or router changes, not on session/token refresh (avoids refetch on window focus)
  }, [user?.id, user?.app_metadata?.role, router]);

  // Realtime subscription: sync inserts and deletes to local state instantly
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("all-plots-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "coverage_plots" },
        async (payload) => {
          const newPlot = payload.new;
          // Fetch user info for the new record
          try {
            const { data: userData } = await supabase
              .from("Users")
              .select("id, name, email")
              .eq("id", newPlot.user_id)
              .single();
            setPlots((prev) => [
              {
                ...newPlot,
                user_name: userData?.name || userData?.email || "Unknown User",
                user_email: userData?.email,
              },
              ...prev,
            ]);
          } catch {
            // Fallback: add with no enrichment – still visible in the table
            setPlots((prev) => [
              { ...newPlot, user_name: "Unknown User", user_email: "" },
              ...prev,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "coverage_plots" },
        (payload) => {
          setPlots((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllPlots = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch all coverage plots
      const { data: plotsData, error: plotsError } = await supabase
        .from("coverage_plots")
        .select("*")
        .order("created_at", { ascending: false });

      if (plotsError) throw plotsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("Users")
        .select("id, name, email");

      if (usersError) throw usersError;

      // Create a user map for quick lookup
      const userMap = {};
      usersData.forEach((user) => {
        userMap[user.id] = user;
      });

      // Transform data to include user_name
      const transformedPlots = plotsData.map(plot => ({
        ...plot,
        user_name: userMap[plot.user_id]?.name || userMap[plot.user_id]?.email || 'Unknown User',
        user_email: userMap[plot.user_id]?.email
      }));

      setPlots(transformedPlots);
    } catch (err) {
      console.error("Error fetching plots:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading plots</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-6 px-8 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          <Layers className="h-7 w-7" />
          Coverage Plots
        </h2>
        <p className="text-center text-gray-200 dark:text-gray-300 mt-2 text-sm">
          View all coverage plots from all users
        </p>
      </div>

      {/* Content Section */}
      <div className="mx-4 py-8">
        <PlotsTable plots={plots} showDeleteOption={true} />
      </div>
    </div>
  )
}

