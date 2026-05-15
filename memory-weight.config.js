export const memoryWeightConfig = {
  version: 1,
  status: "mock-config-only",
  principle: "越接近 Monika 當天真實生命狀態，權重越高；越偏外部資訊或工程狀態，權重越低。",
  weights: [
    { source: "photos", label: "照片 / 生活畫面", weight: 100 },
    { source: "diary", label: "交換日記 / Monika 日記", weight: 90 },
    { source: "lineDog", label: "線條狗 / Dog mode 狀態", weight: 78 },
    { source: "privateProjects", label: "私人專案", weight: 64 },
    { source: "reading", label: "閱讀", weight: 50 },
    { source: "news", label: "新聞", weight: 34 },
    { source: "repo", label: "repo / 工程狀態", weight: 18 },
  ],
};
