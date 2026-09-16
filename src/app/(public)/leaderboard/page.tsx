import { PublicLeaderboard } from "@/features/leaderboard/public-leaderboard";

export const metadata = {
  title: "Community Leaderboard",
  description: "Meet the contributors helping preserve and grow Korot's language knowledge.",
};

export default function LeaderboardPage() {
  return <PublicLeaderboard />;
}
