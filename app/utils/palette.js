var colorOptions = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00',
										'#ffff33','#a65628','#f781bf','#999999','#8dd3c7',
										'#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
										'#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5',
										'#ffed6f'];

export default function randomPalette(count) {
  var results = new Set([]);
  while (results.size !== count) {
    results.add(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
  }
  return Array.from(results);
};
