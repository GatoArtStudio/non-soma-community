/** Groups IPv6 clients by /64, since a single host usually controls the whole prefix. */
export function normalizeNetwork(ip: string): string {
  if (!ip.includes(":")) return ip;
  const withoutZone = ip.split("%")[0].toLowerCase();
  const [head, tail = ""] = withoutZone.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = withoutZone.includes("::") && tail ? tail.split(":") : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  const groups = withoutZone.includes("::")
    ? [...headGroups, ...Array<string>(Math.max(missing, 0)).fill("0"), ...tailGroups]
    : headGroups;
  return groups
    .slice(0, 4)
    .map((group) => group.padStart(4, "0"))
    .join(":");
}
