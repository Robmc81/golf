import { Round } from "@/types";

export const rounds: Round[] = [
  {
    id: "1",
    courseId: "1",
    courseName: "Pebble Beach Golf Links",
    date: "2023-06-15",
    teeId: "blue",
    teeName: "Blue",
    completed: true,
    weather: "Sunny, 72°F",
    notes: "Great round with friends",
    players: [
      {
        id: "user1",
        name: "John Smith",
        totalScore: 82,
        totalToPar: 10,
        scores: [
          { holeNumber: 1, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 2, strokes: 6, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 3, strokes: 4, putts: 1, fairwayHit: true, greenInRegulation: true },
          { holeNumber: 4, strokes: 4, putts: 2, fairwayHit: true, greenInRegulation: true },
          { holeNumber: 5, strokes: 3, putts: 1, fairwayHit: null, greenInRegulation: true },
          { holeNumber: 6, strokes: 6, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 7, strokes: 3, putts: 1, fairwayHit: null, greenInRegulation: true },
          { holeNumber: 8, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 9, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 10, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 11, strokes: 4, putts: 1, fairwayHit: true, greenInRegulation: true },
          { holeNumber: 12, strokes: 4, putts: 2, fairwayHit: null, greenInRegulation: false },
          { holeNumber: 13, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 14, strokes: 6, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 15, strokes: 4, putts: 1, fairwayHit: true, greenInRegulation: true },
          { holeNumber: 16, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 17, strokes: 3, putts: 1, fairwayHit: null, greenInRegulation: true },
          { holeNumber: 18, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: true }
        ]
      }
    ]
  },
  {
    id: "2",
    courseId: "2",
    courseName: "Augusta National Golf Club",
    date: "2023-05-20",
    teeId: "member",
    teeName: "Member",
    completed: true,
    weather: "Partly Cloudy, 68°F",
    notes: "Challenging conditions",
    players: [
      {
        id: "user1",
        name: "John Smith",
        totalScore: 85,
        totalToPar: 13,
        scores: [
          { holeNumber: 1, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 2, strokes: 6, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 3, strokes: 4, putts: 1, fairwayHit: true, greenInRegulation: true },
          { holeNumber: 4, strokes: 4, putts: 2, fairwayHit: null, greenInRegulation: false },
          { holeNumber: 5, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 6, strokes: 3, putts: 1, fairwayHit: null, greenInRegulation: true },
          { holeNumber: 7, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 8, strokes: 6, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 9, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 10, strokes: 6, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 11, strokes: 5, putts: 1, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 12, strokes: 4, putts: 2, fairwayHit: null, greenInRegulation: false },
          { holeNumber: 13, strokes: 6, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 14, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 15, strokes: 6, putts: 2, fairwayHit: true, greenInRegulation: false },
          { holeNumber: 16, strokes: 3, putts: 1, fairwayHit: null, greenInRegulation: true },
          { holeNumber: 17, strokes: 5, putts: 2, fairwayHit: false, greenInRegulation: false },
          { holeNumber: 18, strokes: 5, putts: 2, fairwayHit: true, greenInRegulation: false }
        ]
      }
    ]
  }
];