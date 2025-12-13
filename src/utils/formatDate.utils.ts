export const formatSubscriptionDate = (
  timestamp: number | null | undefined
): string => {
  if (!timestamp) return "";

  const dateString = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));

  return `${dateString}`;
};
