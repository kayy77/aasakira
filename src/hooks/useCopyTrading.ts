import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFollowerAccounts() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("follower_accounts").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return { rows, loading, refresh };
}

export function useMasterAccounts() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("master_accounts").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);
  return { rows, loading };
}

export function useCopyRelationships() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("copy_relationships").select("*, master_accounts(name, broker), follower_accounts(account_number, connection_status)").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return { rows, loading, refresh };
}

export function useCopyActivity(limit = 50) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("copy_activity").select("*").order("occurred_at", { ascending: false }).limit(limit);
      setRows(data ?? []);
    })();
  }, [limit]);
  return rows;
}

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);
  return isAdmin;
}