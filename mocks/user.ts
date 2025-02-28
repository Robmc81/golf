import { User } from "@/types";

export const currentUser: User = {
  id: "user1",
  name: "Rob Mc",
  email: "rob.mc@example.com",
  handicap: 12.4,
  profileImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  stats: {
    averageScore: 83.5,
    fairwaysHit: 0.62,
    greensInRegulation: 0.38,
    puttsPerRound: 32.5,
    averageDriveDistance: 245
  }
};