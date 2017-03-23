export default function overlap(h1, h2) {


  if (h1.topic == h2.topic) {
    if (h1.start <= h2.start && h1.end >= h2.end) {
      //console.log("OVERLAP TRUE")
      return true;
    } else if (h1.start <= h2.start && h1.end <= h2.end && h1.end > h2.start) {
      //console.log("OVERLAP TRUE")

      return true;
    } else if (h2.start <= h1.start && h2.end <= h1.end && h2.end > h1.start) {
      //console.log("OVERLAP TRUE")

      return true;
    } else {
      //console.log("OVERLAP FALSE")

      return false;
    }
  } else {
    //console.log("OVERLAP FALSE")

    return false;
  }
}
