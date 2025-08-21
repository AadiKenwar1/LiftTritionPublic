/**
   * 
   * @param {Array[]} data - data array of what is being smoothed
   * @param {Integer} k - integer defining number of elements smoothed together
   * @returns 
   */
export function smoothData(data, k) {
    const n = data.length;
    const trimmedLength = n - (n % k); // trim end to make divisible by k
    const trimmed = data.slice(0, trimmedLength);
    const smoothed = [];

    for (let i = 0; i < trimmedLength; i += k) {
      const group = trimmed.slice(i, i + k);
      const average = group.reduce((sum, point) => sum + point.value, 0) / k;
      smoothed.push({
        label: `${group[0].label} - ${group[group.length - 1].label}`,
        value: Math.round(average),
      });
    }
    return smoothed;
  }