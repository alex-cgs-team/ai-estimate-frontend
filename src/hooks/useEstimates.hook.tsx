import { rtdb } from "@/firebase";
import { QUERY_KEYS } from "@/shared/constants/keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { FirebaseEstimate, ProjectTableItem } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  equalTo,
  get,
  onValue,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import { useEffect } from "react";

export const useEstimates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const uid = user?.uid;

  const queryResult = useQuery({
    queryKey: [QUERY_KEYS.HISTORY, uid],
    queryFn: async () => {
      if (!uid) return [];

      const estimatesQuery = query(
        ref(rtdb, `profiles/${uid}/estimates`),
        orderByChild("isFinished"),
        equalTo(true)
      );

      const snapshot = await get(estimatesQuery);
      return formatFirebaseData(snapshot.val());
    },
    enabled: !!uid,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!uid) return;

    const estimatesQuery = query(
      ref(rtdb, `profiles/${uid}/estimates`),
      orderByChild("isFinished"),
      equalTo(true)
    );

    const unsubscribe = onValue(
      estimatesQuery,
      (snapshot) => {
        const formattedData = formatFirebaseData(snapshot.val());
        queryClient.setQueryData([QUERY_KEYS.HISTORY, uid], formattedData);
      },
      (error) => {
        console.error("Firebase subscription error:", error);
      }
    );

    return () => unsubscribe();
  }, [uid, queryClient]);

  return queryResult;
};

const formatFirebaseData = (
  val: Record<string, FirebaseEstimate> | null
): ProjectTableItem[] => {
  if (!val) return [];

  return Object.entries(val)
    .map(([id, item]) => ({
      id,
      projectName: item.projectName || "Unnamed Project",
      dateAdded: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
      noteToAi: item.notes || "No notes",
      link: item.fileLink || "#",
      isFinished: item.isFinished,
    }))
    .sort((a, b) => (b.id > a.id ? 1 : -1));
};
