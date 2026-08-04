/* eslint-disable no-unused-vars */

import { useEffect, useMemo, useState, useTransition } from "react";

import { listApplications } from "api";

const useAsyncRows = () => {
  const [_, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const refresh = async () => {
    setLoading(true);
    try {
      const applications = await listApplications();
      startTransition(() => setRows(applications));
    } finally {
      setLoading(false);
    }
  };

  const asyncRows = useMemo(() => ({ loading, rows, refresh }), [loading, rows]);

  useEffect(() => {
    refresh();
  }, []);

  return asyncRows;
};

export default useAsyncRows;