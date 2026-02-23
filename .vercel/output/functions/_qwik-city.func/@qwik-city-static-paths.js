const staticPaths = new Set(["/TOUGHDUCK.png","/TheSafetyHouse-March2023-37.jpg","/TheSafetyHouse-March2023-38.jpg","/The_Safety_House_Logo.png","/blaklader.png","/brands/CX2-Workwear.jpg","/brands/TOUGHDUCK.png","/brands/big_bill_workwear.png","/brands/dickies_workwear_ottawa.png","/brands/oberon.jpg","/brands/orange_river_logo.jpg","/brands/pioneer.png","/brands/redkap.png","/brands/stormtech-logo.jpg","/brands/timberland-pro.png","/brands/viking_work_wear.png","/ca-bk-flag.webp","/carharrt-work-wear-ottawa.jpg","/carhart.png","/embroidery.jpg","/favicon.svg","/flag.webp","/flame-resistant-clothing-ottawa.jpg","/flame-resistant-clothing-ottawa.png","/flame-resistant-clothing.jpg","/footwear-hero.jpg","/footwear.jpg","/hero.jpg","/logo.png","/manifest.json","/personalized_swag_ottawa.png","/q-manifest.json","/robots.txt","/safety-supplies.jpg","/safety_clothing_ottawa.png","/schoolwear.jpg","/sitemap.xml","/work-wear.jpg","/work_boots_ottawa.png","/workwear-herojpg","/workwear.jpg"]);
function isStaticPath(method, url) {
  if (method.toUpperCase() !== 'GET') {
    return false;
  }
  const p = url.pathname;
  if (p.startsWith("/build/")) {
    return true;
  }
  if (p.startsWith("/assets/")) {
    return true;
  }
  if (staticPaths.has(p)) {
    return true;
  }
  if (p.endsWith('/q-data.json')) {
    const pWithoutQdata = p.replace(/\/q-data.json$/, '');
    if (staticPaths.has(pWithoutQdata + '/')) {
      return true;
    }
    if (staticPaths.has(pWithoutQdata)) {
      return true;
    }
  }
  return false;
}
export { isStaticPath };