export type FeedItem = {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  title: string;
  tags: string[];
  price: number;
  likes: number;
  saves: number;
  duration: string;
  verified: boolean;
  gradient: string;
  videoUrl?: string;
  poster?: string;
};

export const feedItems: FeedItem[] = [
  {
    id: "v_001",
    creator: "Luna Vega",
    handle: "@lunavega",
    avatar: "https://i.pravatar.cc/120?img=47",
    title: "Midnight studio session — exclusive cut",
    tags: ["#exclusive", "#studio", "#newdrop"],
    price: 9.99,
    likes: 12483,
    saves: 2104,
    duration: "12:48",
    verified: true,
    gradient: "linear-gradient(135deg,#ff2d87 0%,#7c2bff 55%,#1a0033 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "v_002",
    creator: "Nova Reign",
    handle: "@novareign",
    avatar: "https://i.pravatar.cc/120?img=32",
    title: "Behind the velvet curtain",
    tags: ["#bts", "#velvet", "#solo"],
    price: 6.5,
    likes: 8721,
    saves: 1402,
    duration: "08:21",
    verified: true,
    gradient: "linear-gradient(135deg,#ff6a3d 0%,#ff2d87 50%,#220011 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: "v_003",
    creator: "Jade Monroe",
    handle: "@jademonroe",
    avatar: "https://i.pravatar.cc/120?img=20",
    title: "Penthouse afterhours — full length",
    tags: ["#penthouse", "#afterhours"],
    price: 14.99,
    likes: 23104,
    saves: 4810,
    duration: "22:10",
    verified: true,
    gradient: "linear-gradient(135deg,#22d3ee 0%,#7c2bff 60%,#000010 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: "v_004",
    creator: "Skye Reyes",
    handle: "@skyereyes",
    avatar: "https://i.pravatar.cc/120?img=15",
    title: "Neon balcony — director's cut",
    tags: ["#neon", "#director"],
    price: 4.99,
    likes: 5402,
    saves: 988,
    duration: "06:02",
    verified: false,
    gradient: "linear-gradient(135deg,#84fab0 0%,#8fd3f4 50%,#001220 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: "v_005",
    creator: "Ivy Hart",
    handle: "@ivyhart",
    avatar: "https://i.pravatar.cc/120?img=44",
    title: "Latex & laughter — uncut",
    tags: ["#latex", "#uncut", "#trending"],
    price: 11.0,
    likes: 18420,
    saves: 3201,
    duration: "15:30",
    verified: true,
    gradient: "linear-gradient(135deg,#f72585 0%,#7209b7 50%,#3a0ca3 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
  {
    id: "v_006",
    creator: "Ruby Lane",
    handle: "@rubylane",
    avatar: "https://i.pravatar.cc/120?img=49",
    title: "Crimson hotel suite",
    tags: ["#crimson", "#hotel"],
    price: 7.5,
    likes: 9610,
    saves: 1712,
    duration: "10:14",
    verified: false,
    gradient: "linear-gradient(135deg,#e63946 0%,#9d0208 60%,#1a0000 100%)",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];
