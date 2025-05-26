import { useState, useEffect } from "react";
import { getMyVendor } from "../api/vendors";

export function useVendor() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await getMyVendor();
        setVendor(res.data);
      } catch {
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, []);

  return { vendor, loading };
}