import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchItems = async (params?: any) => {
    setLoading(true);
    try {
      const data = await apiClient.getItems(params);
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [items]);

  return { items, loading, stats, fetchItems, refetch: fetchItems };
}