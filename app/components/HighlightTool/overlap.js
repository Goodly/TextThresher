export default function overlap(h1, h2) {
  if (h1.topic == h2.topic) {
    if (h1.start <= h2.start && h1.end >= h2.end) {
      return true;
    } else if (h1.start <= h2.start && h1.end <= h2.end && h1.end > h2.start) {
      return true;
    } else if (h2.start <= h1.start && h2.end <= h1.end && h2.end > h1.start) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
