import { PublicLeaderboard } from "@/features/leaderboard/public-leaderboard";

export const metadata = {
  title: "Top contributors",
  description: "Korot contributor rankings by submissions and translation activity.",
};

export default function LeaderboardPage() {
  return <PublicLeaderboard />;
}
