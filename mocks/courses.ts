import { GolfCourse } from "@/types";

export const courses: GolfCourse[] = [
  {
    id: "1",
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    image: "https://images.unsplash.com/photo-1587174786825-71a0b9364828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    rating: 74.7,
    slope: 143,
    par: 72,
    tees: [
      { id: "blue", name: "Blue", color: "#0066CC", rating: 74.7, slope: 143 },
      { id: "white", name: "White", color: "#FFFFFF", rating: 72.6, slope: 136 },
      { id: "gold", name: "Gold", color: "#FFD700", rating: 70.3, slope: 129 },
      { id: "red", name: "Red", color: "#FF0000", rating: 69.0, slope: 124 }
    ],
    holes: [
      { number: 1, par: 4, handicap: 8, distance: { blue: 380, white: 365, gold: 340, red: 325 } },
      { number: 2, par: 5, handicap: 12, distance: { blue: 510, white: 495, gold: 475, red: 440 } },
      { number: 3, par: 4, handicap: 14, distance: { blue: 390, white: 375, gold: 360, red: 330 } },
      { number: 4, par: 4, handicap: 16, distance: { blue: 330, white: 320, gold: 305, red: 290 } },
      { number: 5, par: 3, handicap: 18, distance: { blue: 190, white: 180, gold: 165, red: 140 } },
      { number: 6, par: 5, handicap: 2, distance: { blue: 510, white: 495, gold: 475, red: 445 } },
      { number: 7, par: 3, handicap: 17, distance: { blue: 110, white: 105, gold: 100, red: 95 } },
      { number: 8, par: 4, handicap: 13, distance: { blue: 420, white: 405, gold: 385, red: 360 } },
      { number: 9, par: 4, handicap: 7, distance: { blue: 460, white: 445, gold: 425, red: 400 } },
      { number: 10, par: 4, handicap: 9, distance: { blue: 440, white: 425, gold: 405, red: 380 } },
      { number: 11, par: 4, handicap: 5, distance: { blue: 380, white: 365, gold: 345, red: 325 } },
      { number: 12, par: 3, handicap: 15, distance: { blue: 200, white: 190, gold: 175, red: 150 } },
      { number: 13, par: 4, handicap: 3, distance: { blue: 400, white: 385, gold: 365, red: 340 } },
      { number: 14, par: 5, handicap: 1, distance: { blue: 570, white: 550, gold: 525, red: 490 } },
      { number: 15, par: 4, handicap: 11, distance: { blue: 390, white: 375, gold: 355, red: 330 } },
      { number: 16, par: 4, handicap: 6, distance: { blue: 400, white: 385, gold: 365, red: 340 } },
      { number: 17, par: 3, handicap: 10, distance: { blue: 180, white: 170, gold: 155, red: 130 } },
      { number: 18, par: 5, handicap: 4, distance: { blue: 540, white: 525, gold: 505, red: 475 } }
    ]
  },
  {
    id: "2",
    name: "Augusta National Golf Club",
    location: "Augusta, GA",
    image: "https://images.unsplash.com/photo-1587174786825-71a0b9364828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    rating: 76.2,
    slope: 148,
    par: 72,
    tees: [
      { id: "championship", name: "Championship", color: "#000000", rating: 76.2, slope: 148 },
      { id: "member", name: "Member", color: "#0066CC", rating: 74.4, slope: 141 },
      { id: "forward", name: "Forward", color: "#FF0000", rating: 72.0, slope: 135 }
    ],
    holes: [
      { number: 1, par: 4, handicap: 4, distance: { championship: 445, member: 430, forward: 400 } },
      { number: 2, par: 5, handicap: 14, distance: { championship: 575, member: 555, forward: 525 } },
      { number: 3, par: 4, handicap: 10, distance: { championship: 350, member: 340, forward: 320 } },
      { number: 4, par: 3, handicap: 8, distance: { championship: 240, member: 220, forward: 195 } },
      { number: 5, par: 4, handicap: 2, distance: { championship: 495, member: 475, forward: 450 } },
      { number: 6, par: 3, handicap: 16, distance: { championship: 180, member: 170, forward: 155 } },
      { number: 7, par: 4, handicap: 12, distance: { championship: 450, member: 435, forward: 410 } },
      { number: 8, par: 5, handicap: 18, distance: { championship: 570, member: 550, forward: 520 } },
      { number: 9, par: 4, handicap: 6, distance: { championship: 460, member: 445, forward: 420 } },
      { number: 10, par: 4, handicap: 1, distance: { championship: 495, member: 480, forward: 455 } },
      { number: 11, par: 4, handicap: 3, distance: { championship: 505, member: 490, forward: 465 } },
      { number: 12, par: 3, handicap: 13, distance: { championship: 155, member: 150, forward: 140 } },
      { number: 13, par: 5, handicap: 17, distance: { championship: 510, member: 495, forward: 470 } },
      { number: 14, par: 4, handicap: 9, distance: { championship: 440, member: 425, forward: 400 } },
      { number: 15, par: 5, handicap: 15, distance: { championship: 530, member: 515, forward: 490 } },
      { number: 16, par: 3, handicap: 11, distance: { championship: 170, member: 160, forward: 145 } },
      { number: 17, par: 4, handicap: 5, distance: { championship: 440, member: 425, forward: 400 } },
      { number: 18, par: 4, handicap: 7, distance: { championship: 465, member: 450, forward: 425 } }
    ]
  },
  {
    id: "3",
    name: "St Andrews Links (Old Course)",
    location: "St Andrews, Scotland",
    image: "https://images.unsplash.com/photo-1587174786825-71a0b9364828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    rating: 73.1,
    slope: 132,
    par: 72,
    tees: [
      { id: "championship", name: "Championship", color: "#000000", rating: 73.1, slope: 132 },
      { id: "white", name: "White", color: "#FFFFFF", rating: 71.6, slope: 127 },
      { id: "yellow", name: "Yellow", color: "#FFD700", rating: 70.2, slope: 122 },
      { id: "red", name: "Red", color: "#FF0000", rating: 68.8, slope: 117 }
    ],
    holes: [
      { number: 1, par: 4, handicap: 10, distance: { championship: 370, white: 355, yellow: 340, red: 320 } },
      { number: 2, par: 4, handicap: 6, distance: { championship: 410, white: 395, yellow: 380, red: 360 } },
      { number: 3, par: 4, handicap: 12, distance: { championship: 390, white: 375, yellow: 360, red: 340 } },
      { number: 4, par: 4, handicap: 2, distance: { championship: 480, white: 465, yellow: 450, red: 425 } },
      { number: 5, par: 5, handicap: 14, distance: { championship: 520, white: 505, yellow: 490, red: 465 } },
      { number: 6, par: 4, handicap: 8, distance: { championship: 415, white: 400, yellow: 385, red: 365 } },
      { number: 7, par: 4, handicap: 4, distance: { championship: 370, white: 355, yellow: 340, red: 320 } },
      { number: 8, par: 3, handicap: 16, distance: { championship: 175, white: 165, yellow: 155, red: 140 } },
      { number: 9, par: 4, handicap: 18, distance: { championship: 345, white: 335, yellow: 325, red: 310 } },
      { number: 10, par: 4, handicap: 9, distance: { championship: 340, white: 330, yellow: 320, red: 305 } },
      { number: 11, par: 3, handicap: 17, distance: { championship: 170, white: 160, yellow: 150, red: 135 } },
      { number: 12, par: 4, handicap: 3, distance: { championship: 320, white: 310, yellow: 300, red: 285 } },
      { number: 13, par: 4, handicap: 5, distance: { championship: 425, white: 410, yellow: 395, red: 375 } },
      { number: 14, par: 5, handicap: 13, distance: { championship: 530, white: 515, yellow: 500, red: 475 } },
      { number: 15, par: 4, handicap: 1, distance: { championship: 455, white: 440, yellow: 425, red: 405 } },
      { number: 16, par: 4, handicap: 15, distance: { championship: 380, white: 365, yellow: 350, red: 330 } },
      { number: 17, par: 4, handicap: 7, distance: { championship: 455, white: 440, yellow: 425, red: 405 } },
      { number: 18, par: 4, handicap: 11, distance: { championship: 360, white: 345, yellow: 330, red: 310 } }
    ]
  }
];