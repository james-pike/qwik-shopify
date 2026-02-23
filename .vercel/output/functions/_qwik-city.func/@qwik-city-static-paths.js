const staticPaths = new Set(["/TheSafetyHouse-March2023-37.jpg","/TheSafetyHouse-March2023-38.jpg","/The_Safety_House_Logo.png","/brands/CX2-Workwear.jpg","/brands/TOUGHDUCK.png","/brands/atlas.png","/brands/baffin.jpg","/brands/big_bill_workwear.png","/brands/blaklader.png","/brands/blunstone_logo.jpg","/brands/canada-west-boots-logo-1.jpg","/brands/carhart.png","/brands/dickies_workwear_ottawa.png","/brands/dunlop.png","/brands/irish-setter.png","/brands/jb-goodhue.png","/brands/keen.png","/brands/mellow_wailk.jpg","/brands/muck.png","/brands/oberon.jpg","/brands/orange_river_logo.jpg","/brands/pioneer.png","/brands/rasco.png","/brands/red-wing-shoes.jpg","/brands/redback.jpg","/brands/redkap.png","/brands/royer.jpg","/brands/stc.png","/brands/stormtech-logo.jpg","/brands/terra.png","/brands/timberland-pro.png","/brands/viking_work_wear.png","/brands/vismo-logo1-768x500.jpg","/ca-bk-flag.webp","/carharrt-work-wear-ottawa.jpg","/embroidery.jpg","/favicon.svg","/flag.webp","/flame-resistant-clothing-ottawa.jpg","/flame-resistant-clothing-ottawa.png","/flame-resistant-clothing.jpg","/footwear-hero.jpg","/footwear.jpg","/hero.jpg","/logo.png","/manifest.json","/personalized_swag_ottawa.png","/q-manifest.json","/robots.txt","/safety-supplies.jpg","/safety_clothing_ottawa.png","/schoolwear.jpg","/sitemap.xml","/work-wear.jpg","/work_boots_ottawa.png","/workwear-herojpg","/workwear.jpg"]);
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