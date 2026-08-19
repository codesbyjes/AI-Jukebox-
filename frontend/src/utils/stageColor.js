// Maps a stage's capability to one of the five accent families from the
// design spec (doc / write / audio / video / image). Falls back to "doc".
const RULES = [
  { test: /video/i, key: "video" },
  { test: /speech|voice|audio|music/i, key: "audio" },
  { test: /image|logo|design/i, key: "image" },
  { test: /script|writ|content|copy|translat/i, key: "write" },
];

const COLOR_HEX = {
  doc: "#D77AAB",
  write: "#D98C8E",
  audio: "#D85B9D",
  video: "#A477C7",
  image: "#B58AAE",
};

export function stageAccent(capability = "") {
  const match = RULES.find((r) => r.test.test(capability));
  const key = match?.key || "doc";
  return { key, hex: COLOR_HEX[key] };
}
