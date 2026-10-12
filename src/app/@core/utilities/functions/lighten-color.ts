export function lightenColor(hex:string, amount = 0.85) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
  
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
  
    const lighten = (c:any) => Math.round(c + (255 - c) * amount);
  
    const newR = lighten(r);
    const newG = lighten(g);
    const newB = lighten(b);
  
    return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1).toUpperCase()}`;
  }