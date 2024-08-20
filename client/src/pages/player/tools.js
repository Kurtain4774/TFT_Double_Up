export function getRiotRegion(region) {
  switch (region) {
    case "BR":
      return "BR1";
    case "NA":
      return "NA1";
    case "LAN":
      return "LA1";
    case "LAS":
      return "LA2";
    case "EUNE":
      return "EUN1";
    case "EUW":
      return "EUW1";
    case "KR":
      return "KR";
    case "JP":
      return "JP1";
    case "TR":
      return "TR1";
    case "RU":
      return "RU";
    case "OCE":
      return "OC1";
    case "SG":
      return "SG2";
    case "TH":
      return "TH2";
    case "TW":
      return "TW2";
    case "VN":
      return "VN2";
    case "PH":
      return "PH2";
    default:
      return "";
  }
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
