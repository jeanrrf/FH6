export interface CatalogCar {
  brand: string;
  model: string;
  year: number;
  carClass: 'E' | 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X';
  pi: number;
  power: number; // HP
  weight: number; // KG
  drivetrain: 'FWD' | 'RWD' | 'AWD';
  priceCr: number; // In-Game Value in Credits (CR)
  rarity?: 'Autoshow' | 'Exclusive' | 'Wheelspin' | 'Barn Find' | 'Hard-to-Find' | 'DLC';
  engineLocation?: 'Front' | 'Mid' | 'Rear';
  category?: 'Hypercar' | 'Extreme Track Toy' | 'Track Toy' | 'Supercar' | 'Retro Supercar' | 'JDM' | 'Modern Muscle' | 'Classic Muscle' | 'Rally' | 'Super Saloon' | 'Hot Hatch' | 'GT' | 'Off-road' | 'Vintage Racer' | 'Drift' | 'Classic';
  country?: string;
  engineType?: string;
}

export function formatCr(cr?: number): string {
  if (cr === undefined || cr === null) return '0 CR';
  if (cr >= 1000000) {
    const m = (cr / 1000000).toFixed(cr % 1000000 === 0 ? 0 : 1);
    return `${m}M CR`;
  }
  return `${cr.toLocaleString('en-US')} CR`;
}

export const CAR_CATALOG: CatalogCar[] = [
  // ==========================================
  // CLASS X & S2: HYPERCARS & EXTREME TRACK TOYS
  // ==========================================
  { brand: 'Aston Martin', model: 'Valkyrie', year: 2019, carClass: 'X', pi: 999, power: 1160, weight: 1030, drivetrain: 'RWD', priceCr: 3500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'UK', engineType: '6.5L V12 Hybrid' },
  { brand: 'Apollo', model: 'Intensa Emozione', year: 2018, carClass: 'X', pi: 998, power: 780, weight: 1250, drivetrain: 'RWD', priceCr: 1500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Germany', engineType: '6.3L V12 N/A' },
  { brand: 'Ferrari', model: 'FXX-K Evo', year: 2018, carClass: 'X', pi: 998, power: 1036, weight: 1255, drivetrain: 'RWD', priceCr: 2700000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Italy', engineType: '6.3L V12 Hybrid' },
  { brand: 'Pagani', model: 'Zonda R', year: 2010, carClass: 'X', pi: 995, power: 740, weight: 1070, drivetrain: 'RWD', priceCr: 1800000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Italy', engineType: '6.0L V12 N/A' },
  { brand: 'Mercedes-AMG', model: 'Mercedes-AMG ONE', year: 2021, carClass: 'S2', pi: 984, power: 1049, weight: 1695, drivetrain: 'AWD', priceCr: 2700000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Germany', engineType: '1.6L V6 Turbo F1 Hybrid' },
  { brand: 'Koenigsegg', model: 'Jesko', year: 2020, carClass: 'S2', pi: 978, power: 1600, weight: 1420, drivetrain: 'RWD', priceCr: 2800000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Sweden', engineType: '5.0L Twin-Turbo V8' },
  { brand: 'McLaren', model: 'Senna', year: 2018, carClass: 'S2', pi: 970, power: 789, weight: 1198, drivetrain: 'RWD', priceCr: 1000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'UK', engineType: '4.0L Twin-Turbo V8' },
  { brand: 'Rimac', model: 'Nevera', year: 2021, carClass: 'S2', pi: 975, power: 1914, weight: 2150, drivetrain: 'AWD', priceCr: 2400000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Croatia', engineType: 'Quad Electric Motors' },
  { brand: 'Ferrari', model: 'LaFerrari', year: 2013, carClass: 'S2', pi: 966, power: 949, weight: 1430, drivetrain: 'RWD', priceCr: 1500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '6.3L V12 Hybrid' },
  { brand: 'Porsche', model: '918 Spyder', year: 2014, carClass: 'S2', pi: 960, power: 887, weight: 1640, drivetrain: 'AWD', priceCr: 850000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Germany', engineType: '4.6L V8 Hybrid' },
  { brand: 'McLaren', model: 'P1', year: 2013, carClass: 'S2', pi: 955, power: 903, weight: 1490, drivetrain: 'RWD', priceCr: 1350000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'UK', engineType: '3.8L Twin-Turbo V8 Hybrid' },
  { brand: 'Lamborghini', model: 'Sesto Elemento', year: 2011, carClass: 'S2', pi: 950, power: 570, weight: 999, drivetrain: 'AWD', priceCr: 2500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Italy', engineType: '5.2L V10 N/A' },
  { brand: 'Bugatti', model: 'Chiron', year: 2018, carClass: 'S2', pi: 925, power: 1479, weight: 1995, drivetrain: 'AWD', priceCr: 2400000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'France', engineType: '8.0L Quad-Turbo W16' },
  { brand: 'Bugatti', model: 'Divo', year: 2019, carClass: 'S2', pi: 940, power: 1479, weight: 1960, drivetrain: 'AWD', priceCr: 3000000, rarity: 'Exclusive', engineLocation: 'Mid', category: 'Hypercar', country: 'France', engineType: '8.0L Quad-Turbo W16' },
  { brand: 'Bugatti', model: 'Veyron Super Sport', year: 2011, carClass: 'S2', pi: 915, power: 1183, weight: 1838, drivetrain: 'AWD', priceCr: 2200000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'France', engineType: '8.0L Quad-Turbo W16' },
  { brand: 'Koenigsegg', model: 'Agera RS', year: 2017, carClass: 'S2', pi: 965, power: 1360, weight: 1395, drivetrain: 'RWD', priceCr: 2000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Sweden', engineType: '5.0L Twin-Turbo V8' },
  { brand: 'Koenigsegg', model: 'One:1', year: 2015, carClass: 'S2', pi: 970, power: 1341, weight: 1360, drivetrain: 'RWD', priceCr: 2800000, rarity: 'Exclusive', engineLocation: 'Mid', category: 'Hypercar', country: 'Sweden', engineType: '5.0L Twin-Turbo V8' },
  { brand: 'Koenigsegg', model: 'Regera', year: 2016, carClass: 'S2', pi: 945, power: 1500, weight: 1590, drivetrain: 'RWD', priceCr: 1900000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Sweden', engineType: '5.0L V8 Hybrid' },
  { brand: 'Pagani', model: 'Huayra BC', year: 2016, carClass: 'S2', pi: 935, power: 789, weight: 1218, drivetrain: 'RWD', priceCr: 2700000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '6.0L Twin-Turbo V12' },
  { brand: 'Pagani', model: 'Zonda Cinque Roadster', year: 2009, carClass: 'S2', pi: 930, power: 678, weight: 1210, drivetrain: 'RWD', priceCr: 2100000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '7.3L V12 N/A' },
  { brand: 'Lamborghini', model: 'Aventador SVJ', year: 2019, carClass: 'S2', pi: 920, power: 759, weight: 1525, drivetrain: 'AWD', priceCr: 550000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'Italy', engineType: '6.5L V12 N/A' },
  { brand: 'Lamborghini', model: 'Centenario LP 770-4', year: 2016, carClass: 'S2', pi: 922, power: 759, weight: 1520, drivetrain: 'AWD', priceCr: 2300000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '6.5L V12 N/A' },
  { brand: 'Lamborghini', model: 'Veneno', year: 2013, carClass: 'S2', pi: 925, power: 740, weight: 1450, drivetrain: 'AWD', priceCr: 3000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '6.5L V12 N/A' },
  { brand: 'Lamborghini', model: 'Huracán STO', year: 2021, carClass: 'S2', pi: 918, power: 631, weight: 1339, drivetrain: 'RWD', priceCr: 380000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Italy', engineType: '5.2L V10 N/A' },
  { brand: 'Ferrari', model: 'SF90 Stradale', year: 2020, carClass: 'S2', pi: 955, power: 986, weight: 1570, drivetrain: 'AWD', priceCr: 500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Italy', engineType: '4.0L V8 Hybrid' },
  { brand: 'Ferrari', model: '488 Pista', year: 2019, carClass: 'S2', pi: 915, power: 710, weight: 1385, drivetrain: 'RWD', priceCr: 330000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Italy', engineType: '3.9L Twin-Turbo V8' },
  { brand: 'Ferrari', model: '812 Superfast', year: 2017, carClass: 'S2', pi: 910, power: 789, weight: 1630, drivetrain: 'RWD', priceCr: 350000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'Italy', engineType: '6.5L V12 N/A' },
  { brand: 'Ferrari', model: '599XX Evolution', year: 2012, carClass: 'S2', pi: 975, power: 740, weight: 1310, drivetrain: 'RWD', priceCr: 2600000, rarity: 'Hard-to-Find', engineLocation: 'Front', category: 'Extreme Track Toy', country: 'Italy', engineType: '6.0L V12 N/A' },
  { brand: 'Ferrari', model: 'Enzo Ferrari', year: 2002, carClass: 'S2', pi: 902, power: 651, weight: 1255, drivetrain: 'RWD', priceCr: 2800000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Italy', engineType: '6.0L V12 N/A' },
  { brand: 'Porsche', model: '911 GT2 RS (991.2)', year: 2018, carClass: 'S2', pi: 935, power: 700, weight: 1470, drivetrain: 'RWD', priceCr: 315000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Track Toy', country: 'Germany', engineType: '3.8L Twin-Turbo Flat-6' },
  { brand: 'Porsche', model: '911 GT3 RS (992)', year: 2023, carClass: 'S2', pi: 928, power: 518, weight: 1450, drivetrain: 'RWD', priceCr: 275000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Track Toy', country: 'Germany', engineType: '4.0L Flat-6 N/A' },
  { brand: 'Porsche', model: 'Carrera GT', year: 2003, carClass: 'S2', pi: 905, power: 603, weight: 1380, drivetrain: 'RWD', priceCr: 1000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Germany', engineType: '5.7L V10 N/A' },
  { brand: 'McLaren', model: '765LT', year: 2021, carClass: 'S2', pi: 930, power: 755, weight: 1339, drivetrain: 'RWD', priceCr: 380000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'UK', engineType: '4.0L Twin-Turbo V8' },
  { brand: 'McLaren', model: 'Speedtail', year: 2019, carClass: 'S2', pi: 940, power: 1035, weight: 1430, drivetrain: 'RWD', priceCr: 2250000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'UK', engineType: '4.0L Twin-Turbo V8 Hybrid' },
  { brand: 'McLaren', model: 'F1 GT', year: 1997, carClass: 'S2', pi: 910, power: 627, weight: 1120, drivetrain: 'RWD', priceCr: 15000000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'Retro Supercar', country: 'UK', engineType: '6.1L V12 N/A' },
  { brand: 'Aston Martin', model: 'Vulcan AMR Pro', year: 2017, carClass: 'S2', pi: 960, power: 820, weight: 1350, drivetrain: 'RWD', priceCr: 2000000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Extreme Track Toy', country: 'UK', engineType: '7.0L V12 N/A' },
  { brand: 'Aston Martin', model: 'Valhalla Concept Car', year: 2019, carClass: 'S2', pi: 955, power: 937, weight: 1550, drivetrain: 'AWD', priceCr: 1150000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'UK', engineType: '4.0L Twin-Turbo V8 Hybrid' },
  { brand: 'Aston Martin', model: 'One-77', year: 2010, carClass: 'S2', pi: 901, power: 750, weight: 1500, drivetrain: 'RWD', priceCr: 1400000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'UK', engineType: '7.3L V12 N/A' },
  { brand: 'Mercedes-AMG', model: 'GT Black Series', year: 2021, carClass: 'S2', pi: 915, power: 720, weight: 1540, drivetrain: 'RWD', priceCr: 350000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '4.0L Twin-Turbo V8 Flat-Plane' },
  { brand: 'Mercedes-Benz', model: 'CLK GTR', year: 1998, carClass: 'S2', pi: 908, power: 604, weight: 1440, drivetrain: 'RWD', priceCr: 2000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Germany', engineType: '6.9L V12 N/A' },
  { brand: 'Maserati', model: 'MC12', year: 2004, carClass: 'S2', pi: 905, power: 621, weight: 1335, drivetrain: 'RWD', priceCr: 1000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Italy', engineType: '6.0L V12 N/A' },
  { brand: 'Zenvo', model: 'TSR-S', year: 2019, carClass: 'S2', pi: 940, power: 1177, weight: 1495, drivetrain: 'RWD', priceCr: 1200000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'Denmark', engineType: '5.8L Twin-Supercharged V8' },
  { brand: 'Hennessey', model: 'Venom F5', year: 2021, carClass: 'S2', pi: 975, power: 1817, weight: 1360, drivetrain: 'RWD', priceCr: 3000000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'Hypercar', country: 'USA', engineType: '6.6L Twin-Turbo V8 Fury' },
  { brand: 'SSC', model: 'Tuatara', year: 2020, carClass: 'S2', pi: 980, power: 1750, weight: 1247, drivetrain: 'RWD', priceCr: 2500000, rarity: 'Exclusive', engineLocation: 'Mid', category: 'Hypercar', country: 'USA', engineType: '5.9L Twin-Turbo V8' },
  { brand: 'GMA', model: 'T.50', year: 2022, carClass: 'S2', pi: 935, power: 654, weight: 986, drivetrain: 'RWD', priceCr: 3200000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'Hypercar', country: 'UK', engineType: '3.9L Cosworth V12 12,100 RPM' },
  { brand: 'Radical', model: 'RXC Turbo', year: 2015, carClass: 'S2', pi: 930, power: 454, weight: 940, drivetrain: 'RWD', priceCr: 330000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'UK', engineType: '3.5L Twin-Turbo V6' },
  { brand: 'BAC', model: 'Mono', year: 2014, carClass: 'S2', pi: 902, power: 305, weight: 580, drivetrain: 'RWD', priceCr: 160000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'UK', engineType: '2.5L 4-Cyl N/A' },
  { brand: 'Ariel', model: 'Atom 500 V8', year: 2013, carClass: 'S2', pi: 920, power: 500, weight: 550, drivetrain: 'RWD', priceCr: 200000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Extreme Track Toy', country: 'UK', engineType: '3.0L V8 N/A' },
  { brand: 'KTM', model: 'X-Bow GT4', year: 2018, carClass: 'S2', pi: 910, power: 360, weight: 975, drivetrain: 'RWD', priceCr: 130000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Austria', engineType: '2.0L Turbo 4-Cyl' },
  { brand: 'Brabham', model: 'BT62', year: 2019, carClass: 'S2', pi: 965, power: 700, weight: 972, drivetrain: 'RWD', priceCr: 1500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'Australia', engineType: '5.4L V8 N/A' },
  { brand: 'Hoonigan', model: 'Ford Mustang "Hoonicorn" V2', year: 1965, carClass: 'S2', pi: 975, power: 1400, weight: 1360, drivetrain: 'AWD', priceCr: 500000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Drift', country: 'USA', engineType: '6.7L Twin-Turbo V8 Methanol' },
  { brand: 'Hoonigan', model: 'Porsche 911 "Hoonipigasus"', year: 1995, carClass: 'S2', pi: 990, power: 1400, weight: 1000, drivetrain: 'AWD', priceCr: 1000000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'Extreme Track Toy', country: 'USA', engineType: '4.0L Twin-Turbo Flat-6' },

  // ==========================================
  // CLASS S1: CIRCUIT WEAPONS, GT & MODERN SUPER
  // ==========================================
  { brand: 'Nissan', model: 'GT-R Nismo (R35)', year: 2020, carClass: 'S1', pi: 890, power: 600, weight: 1720, drivetrain: 'AWD', priceCr: 210000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'Japan', engineType: '3.8L Twin-Turbo V6 VR38DETT' },
  { brand: 'Porsche', model: '911 GT3 RS (991.2)', year: 2019, carClass: 'S1', pi: 900, power: 520, weight: 1430, drivetrain: 'RWD', priceCr: 255000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Track Toy', country: 'Germany', engineType: '4.0L Flat-6 N/A' },
  { brand: 'Chevrolet', model: 'Corvette Z06 (C8)', year: 2023, carClass: 'S1', pi: 890, power: 670, weight: 1560, drivetrain: 'RWD', priceCr: 130000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'USA', engineType: '5.5L Flat-Plane V8 LT6' },
  { brand: 'Chevrolet', model: 'Corvette ZR1 (C7)', year: 2019, carClass: 'S1', pi: 895, power: 755, weight: 1614, drivetrain: 'RWD', priceCr: 130000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'USA', engineType: '6.2L Supercharged V8 LT5' },
  { brand: 'Ford', model: 'Ford GT', year: 2017, carClass: 'S1', pi: 885, power: 647, weight: 1385, drivetrain: 'RWD', priceCr: 400000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'USA', engineType: '3.5L Twin-Turbo EcoBoost V6' },
  { brand: 'Ford', model: 'Ford GT', year: 2005, carClass: 'S1', pi: 830, power: 550, weight: 1520, drivetrain: 'RWD', priceCr: 300000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'USA', engineType: '5.4L Supercharged V8' },
  { brand: 'Dodge', model: 'Viper ACR', year: 2016, carClass: 'S1', pi: 895, power: 645, weight: 1540, drivetrain: 'RWD', priceCr: 140000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'USA', engineType: '8.4L V10 N/A' },
  { brand: 'Audi', model: 'R8 V10 Plus', year: 2016, carClass: 'S1', pi: 880, power: 602, weight: 1650, drivetrain: 'AWD', priceCr: 175000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'Germany', engineType: '5.2L V10 N/A' },
  { brand: 'Mercedes-AMG', model: 'GT R', year: 2017, carClass: 'S1', pi: 870, power: 577, weight: 1630, drivetrain: 'RWD', priceCr: 160000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '4.0L Twin-Turbo V8' },
  { brand: 'Mercedes-Benz', model: 'SLS AMG Black Series', year: 2013, carClass: 'S1', pi: 865, power: 622, weight: 1550, drivetrain: 'RWD', priceCr: 550000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'Germany', engineType: '6.2L V8 N/A' },
  { brand: 'BMW', model: 'M8 Competition Coupé', year: 2020, carClass: 'S1', pi: 840, power: 617, weight: 1960, drivetrain: 'AWD', priceCr: 170000, rarity: 'Autoshow', engineLocation: 'Front', category: 'GT', country: 'Germany', engineType: '4.4L Twin-Turbo V8' },
  { brand: 'BMW', model: 'M4 CSL', year: 2023, carClass: 'S1', pi: 860, power: 543, weight: 1625, drivetrain: 'RWD', priceCr: 180000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '3.0L Twin-Turbo Inline-6 S58' },
  { brand: 'BMW', model: 'M3 GTR', year: 2005, carClass: 'S1', pi: 850, power: 450, weight: 1120, drivetrain: 'RWD', priceCr: 260000, rarity: 'Wheelspin', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '4.0L V8 P60B40' },
  { brand: 'Ferrari', model: 'F40', year: 1987, carClass: 'S1', pi: 830, power: 471, weight: 1250, drivetrain: 'RWD', priceCr: 1200000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Italy', engineType: '2.9L Twin-Turbo V8' },
  { brand: 'Ferrari', model: 'F50', year: 1995, carClass: 'S1', pi: 845, power: 513, weight: 1230, drivetrain: 'RWD', priceCr: 2000000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Retro Supercar', country: 'Italy', engineType: '4.7L V12 N/A (F1 derived)' },
  { brand: 'Ferrari', model: '458 Speciale', year: 2013, carClass: 'S1', pi: 885, power: 597, weight: 1395, drivetrain: 'RWD', priceCr: 340000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Italy', engineType: '4.5L V8 N/A 9000 RPM' },
  { brand: 'Ferrari', model: 'Roma', year: 2020, carClass: 'S1', pi: 855, power: 612, weight: 1570, drivetrain: 'RWD', priceCr: 230000, rarity: 'Autoshow', engineLocation: 'Front', category: 'GT', country: 'Italy', engineType: '3.9L Twin-Turbo V8' },
  { brand: 'Honda', model: 'NSX-R GT', year: 2005, carClass: 'S1', pi: 820, power: 290, weight: 1270, drivetrain: 'RWD', priceCr: 2500000, rarity: 'Hard-to-Find', engineLocation: 'Mid', category: 'JDM', country: 'Japan', engineType: '3.2L V6 VTEC C32B' },
  { brand: 'Acura', model: 'NSX (Gen 2)', year: 2017, carClass: 'S1', pi: 860, power: 573, weight: 1725, drivetrain: 'AWD', priceCr: 170000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'USA', engineType: '3.5L Twin-Turbo V6 Hybrid' },
  { brand: 'Lexus', model: 'LFA', year: 2010, carClass: 'S1', pi: 840, power: 552, weight: 1480, drivetrain: 'RWD', priceCr: 500000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'Japan', engineType: '4.8L V10 1LR-GUE 9000 RPM' },
  { brand: 'Lexus', model: 'LFA Nürburgring Edition', year: 2012, carClass: 'S1', pi: 865, power: 562, weight: 1470, drivetrain: 'RWD', priceCr: 800000, rarity: 'Exclusive', engineLocation: 'Front', category: 'Track Toy', country: 'Japan', engineType: '4.8L V10 1LR-GUE' },
  { brand: 'Jaguar', model: 'XJ220', year: 1992, carClass: 'S1', pi: 825, power: 542, weight: 1470, drivetrain: 'RWD', priceCr: 650000, rarity: 'Barn Find', engineLocation: 'Mid', category: 'Retro Supercar', country: 'UK', engineType: '3.5L Twin-Turbo V6' },
  { brand: 'Jaguar', model: 'F-Type SVR', year: 2017, carClass: 'S1', pi: 835, power: 575, weight: 1705, drivetrain: 'AWD', priceCr: 125000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'UK', engineType: '5.0L Supercharged V8' },
  { brand: 'Maserati', model: 'MC20', year: 2021, carClass: 'S1', pi: 895, power: 621, weight: 1500, drivetrain: 'RWD', priceCr: 215000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'Italy', engineType: '3.0L Twin-Turbo V6 Nettuno' },
  { brand: 'Lotus', model: 'Exige Cup 430', year: 2018, carClass: 'S1', pi: 870, power: 430, weight: 1056, drivetrain: 'RWD', priceCr: 120000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'UK', engineType: '3.5L Supercharged V6' },
  { brand: 'Lotus', model: 'Evija', year: 2020, carClass: 'S1', pi: 899, power: 1972, weight: 1680, drivetrain: 'AWD', priceCr: 2500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hypercar', country: 'UK', engineType: 'Quad Electric Motors' },
  { brand: 'Lotus', model: 'Emira V6 First Edition', year: 2022, carClass: 'S1', pi: 810, power: 400, weight: 1405, drivetrain: 'RWD', priceCr: 85000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'UK', engineType: '3.5L Supercharged V6' },
  { brand: 'Porsche', model: '718 Cayman GT4 RS', year: 2022, carClass: 'S1', pi: 885, power: 493, weight: 1415, drivetrain: 'RWD', priceCr: 160000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Germany', engineType: '4.0L Flat-6 N/A 9000 RPM' },
  { brand: 'Porsche', model: '959', year: 1987, carClass: 'S1', pi: 815, power: 444, weight: 1450, drivetrain: 'AWD', priceCr: 2000000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Retro Supercar', country: 'Germany', engineType: '2.8L Twin-Turbo Flat-6' },
  { brand: 'Shelby', model: 'GT500 (S550)', year: 2020, carClass: 'S1', pi: 850, power: 760, weight: 1890, drivetrain: 'RWD', priceCr: 90000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '5.2L Supercharged Predator V8' },
  { brand: 'Dodge', model: 'Challenger SRT Demon', year: 2018, carClass: 'S1', pi: 845, power: 840, weight: 1941, drivetrain: 'RWD', priceCr: 150000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '6.2L Supercharged HEMI V8' },
  { brand: 'Hoonigan', model: 'Ford Escort RS Cosworth "Cossie V2"', year: 1991, carClass: 'S1', pi: 875, power: 620, weight: 1220, drivetrain: 'AWD', priceCr: 500000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Rally', country: 'USA', engineType: '2.0L Turbo YB' },
  { brand: 'Hoonigan', model: 'Ford RS200 Evolution', year: 1986, carClass: 'S1', pi: 890, power: 750, weight: 1050, drivetrain: 'AWD', priceCr: 500000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Rally', country: 'USA', engineType: '2.1L Turbo BDT-E' },

  // ==========================================
  // CLASS A: TUNERS, SPORTS CARS & POWER HEROES
  // ==========================================
  { brand: 'Ford', model: 'Mustang GT', year: 2024, carClass: 'A', pi: 750, power: 480, weight: 1730, drivetrain: 'RWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '5.0L Coyote V8 Gen 4' },
  { brand: 'Ford', model: 'Mustang Dark Horse', year: 2024, carClass: 'A', pi: 775, power: 500, weight: 1750, drivetrain: 'RWD', priceCr: 60000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '5.0L Coyote V8' },
  { brand: 'Ford', model: 'Shelby GT350R', year: 2016, carClass: 'A', pi: 795, power: 526, weight: 1680, drivetrain: 'RWD', priceCr: 75000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'USA', engineType: '5.2L Voodoo Flat-Plane V8' },
  { brand: 'BMW', model: 'M4 Competition Coupé', year: 2021, carClass: 'A', pi: 780, power: 503, weight: 1775, drivetrain: 'RWD', priceCr: 80000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '3.0L Twin-Turbo S58' },
  { brand: 'BMW', model: 'M5 CS', year: 2021, carClass: 'A', pi: 799, power: 627, weight: 1825, drivetrain: 'AWD', priceCr: 140000, rarity: 'Hard-to-Find', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '4.4L Twin-Turbo V8' },
  { brand: 'BMW', model: 'M2 CS', year: 2020, carClass: 'A', pi: 770, power: 444, weight: 1550, drivetrain: 'RWD', priceCr: 85000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '3.0L Twin-Turbo S55' },
  { brand: 'BMW', model: 'M3 (E92)', year: 2008, carClass: 'A', pi: 730, power: 414, weight: 1600, drivetrain: 'RWD', priceCr: 48000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '4.0L V8 S65 8400 RPM' },
  { brand: 'Toyota', model: 'GR Supra', year: 2020, carClass: 'A', pi: 740, power: 382, weight: 1495, drivetrain: 'RWD', priceCr: 55000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '3.0L Turbo Inline-6 B58' },
  { brand: 'Toyota', model: 'GR Yaris RZ', year: 2021, carClass: 'A', pi: 715, power: 268, weight: 1280, drivetrain: 'AWD', priceCr: 40000, rarity: 'Exclusive', engineLocation: 'Front', category: 'Hot Hatch', country: 'Japan', engineType: '1.6L Turbo 3-Cyl G16E-GTS' },
  { brand: 'Toyota', model: '2000GT', year: 1969, carClass: 'A', pi: 700, power: 150, weight: 1120, drivetrain: 'RWD', priceCr: 750000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Classic', country: 'Japan', engineType: '2.0L Inline-6' },
  { brand: 'Chevrolet', model: 'Camaro ZL1 1LE', year: 2018, carClass: 'A', pi: 790, power: 650, weight: 1740, drivetrain: 'RWD', priceCr: 70000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '6.2L Supercharged LT4 V8' },
  { brand: 'Chevrolet', model: 'Corvette Stingray (C8)', year: 2020, carClass: 'A', pi: 785, power: 495, weight: 1530, drivetrain: 'RWD', priceCr: 65000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Supercar', country: 'USA', engineType: '6.2L LT2 V8' },
  { brand: 'Chevrolet', model: 'Corvette ZR1 (C6)', year: 2009, carClass: 'A', pi: 790, power: 638, weight: 1515, drivetrain: 'RWD', priceCr: 95000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'USA', engineType: '6.2L Supercharged LS9 V8' },
  { brand: 'Alfa Romeo', model: 'Giulia Quadrifoglio', year: 2017, carClass: 'A', pi: 760, power: 505, weight: 1620, drivetrain: 'RWD', priceCr: 75000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Italy', engineType: '2.9L Twin-Turbo 90° V6' },
  { brand: 'Alfa Romeo', model: '4C', year: 2014, carClass: 'A', pi: 735, power: 237, weight: 895, drivetrain: 'RWD', priceCr: 60000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Italy', engineType: '1.75L Turbo 4-Cyl' },
  { brand: 'Alfa Romeo', model: '8C Competizione', year: 2007, carClass: 'A', pi: 765, power: 444, weight: 1585, drivetrain: 'RWD', priceCr: 250000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Supercar', country: 'Italy', engineType: '4.7L V8 (Ferrari derived)' },
  { brand: 'Porsche', model: 'Cayman GT4 (981)', year: 2016, carClass: 'A', pi: 775, power: 385, weight: 1340, drivetrain: 'RWD', priceCr: 90000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'Germany', engineType: '3.8L Flat-6 N/A' },
  { brand: 'Porsche', model: '911 Carrera S (992)', year: 2019, carClass: 'A', pi: 780, power: 443, weight: 1515, drivetrain: 'RWD', priceCr: 120000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Supercar', country: 'Germany', engineType: '3.0L Twin-Turbo Flat-6' },
  { brand: 'Audi', model: 'RS 6 Avant', year: 2021, carClass: 'A', pi: 765, power: 591, weight: 2075, drivetrain: 'AWD', priceCr: 110000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '4.0L Twin-Turbo Mild-Hybrid V8' },
  { brand: 'Audi', model: 'RS 7 Sportback', year: 2021, carClass: 'A', pi: 770, power: 591, weight: 2065, drivetrain: 'AWD', priceCr: 120000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '4.0L Twin-Turbo Mild-Hybrid V8' },
  { brand: 'Audi', model: 'RS 3 Sedan', year: 2020, carClass: 'A', pi: 745, power: 394, weight: 1575, drivetrain: 'AWD', priceCr: 55000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '2.5L Turbo 5-Cyl 1-2-4-5-3' },
  { brand: 'Audi', model: 'Sport Quattro', year: 1983, carClass: 'A', pi: 720, power: 302, weight: 1298, drivetrain: 'AWD', priceCr: 175000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Rally', country: 'Germany', engineType: '2.1L Turbo 5-Cyl 20V' },
  { brand: 'Nissan', model: 'Skyline GT-R V-Spec II (R34)', year: 2002, carClass: 'A', pi: 710, power: 327, weight: 1560, drivetrain: 'AWD', priceCr: 63000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.6L Twin-Turbo RB26DETT' },
  { brand: 'Nissan', model: 'Z Performance', year: 2023, carClass: 'A', pi: 755, power: 400, weight: 1600, drivetrain: 'RWD', priceCr: 50000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '3.0L Twin-Turbo VR30DDTT' },
  { brand: 'Nissan', model: '370Z Nismo', year: 2019, carClass: 'A', pi: 725, power: 350, weight: 1540, drivetrain: 'RWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '3.7L V6 VQ37VHR' },
  { brand: 'Dodge', model: 'Charger SRT Hellcat', year: 2015, carClass: 'A', pi: 770, power: 707, weight: 2075, drivetrain: 'RWD', priceCr: 80000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Modern Muscle', country: 'USA', engineType: '6.2L Supercharged HEMI V8' },
  { brand: 'Dodge', model: 'Viper GTS', year: 1999, carClass: 'A', pi: 760, power: 450, weight: 1530, drivetrain: 'RWD', priceCr: 95000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Retro Supercar', country: 'USA', engineType: '8.0L V10 N/A' },
  { brand: 'Subaru', model: 'WRX STI S209', year: 2019, carClass: 'A', pi: 730, power: 341, weight: 1580, drivetrain: 'AWD', priceCr: 65000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.5L Turbo Boxer EJ257' },
  { brand: 'Subaru', model: 'Impreza 22B STi', year: 1998, carClass: 'A', pi: 720, power: 276, weight: 1270, drivetrain: 'AWD', priceCr: 120000, rarity: 'Wheelspin', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.2L Turbo Boxer EJ22G' },
  { brand: 'Mitsubishi', model: 'Lancer Evolution VI GSR Tommi Mäkinen', year: 1999, carClass: 'A', pi: 715, power: 276, weight: 1360, drivetrain: 'AWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Rally', country: 'Japan', engineType: '2.0L Turbo 4G63' },
  { brand: 'Alpine', model: 'A110', year: 2017, carClass: 'A', pi: 725, power: 249, weight: 1080, drivetrain: 'RWD', priceCr: 65000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Track Toy', country: 'France', engineType: '1.8L Turbo 4-Cyl' },
  { brand: 'Lancia', model: 'Delta HF Integrale EVO', year: 1992, carClass: 'A', pi: 705, power: 210, weight: 1300, drivetrain: 'AWD', priceCr: 100000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Rally', country: 'Italy', engineType: '2.0L Turbo 16V' },
  { brand: 'Lancia', model: '037 Stradale', year: 1982, carClass: 'A', pi: 710, power: 205, weight: 1170, drivetrain: 'RWD', priceCr: 350000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Rally', country: 'Italy', engineType: '2.0L Supercharged Volumex' },
  { brand: 'Lancia', model: 'Stratos HF', year: 1974, carClass: 'A', pi: 700, power: 190, weight: 980, drivetrain: 'RWD', priceCr: 550000, rarity: 'Barn Find', engineLocation: 'Mid', category: 'Rally', country: 'Italy', engineType: '2.4L Ferrari Dino V6' },
  { brand: 'Shelby', model: 'Cobra 427 S/C', year: 1965, carClass: 'A', pi: 740, power: 485, weight: 1068, drivetrain: 'RWD', priceCr: 2100000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '7.0L FE 427 V8' },
  { brand: 'Shelby', model: 'Cobra Daytona Coupe', year: 1965, carClass: 'A', pi: 760, power: 390, weight: 1043, drivetrain: 'RWD', priceCr: 8000000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Vintage Racer', country: 'USA', engineType: '4.7L 289 V8' },
  { brand: 'Plymouth', model: 'Hemi Cuda', year: 1971, carClass: 'A', pi: 705, power: 425, weight: 1760, drivetrain: 'RWD', priceCr: 160000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '7.0L 426 HEMI V8' },
  { brand: 'Jeep', model: 'Grand Cherokee Trackhawk', year: 2018, carClass: 'A', pi: 735, power: 707, weight: 2433, drivetrain: 'AWD', priceCr: 90000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'USA', engineType: '6.2L Supercharged HEMI V8' },

  // ==========================================
  // CLASS B: JDM LEGENDS, SPORT COUPES & HOT HATCH
  // ==========================================
  { brand: 'Toyota', model: 'Supra RZ (A80)', year: 1998, carClass: 'B', pi: 680, power: 320, weight: 1510, drivetrain: 'RWD', priceCr: 38000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '3.0L Twin-Turbo 2JZ-GTE' },
  { brand: 'Subaru', model: 'Impreza WRX STI', year: 2004, carClass: 'B', pi: 650, power: 300, weight: 1470, drivetrain: 'AWD', priceCr: 28000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.5L Turbo Boxer EJ257' },
  { brand: 'Subaru', model: 'BRZ', year: 2022, carClass: 'B', pi: 640, power: 228, weight: 1277, drivetrain: 'RWD', priceCr: 32000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.4L Boxer FA24D' },
  { brand: 'Mitsubishi', model: 'Lancer Evolution IX MR', year: 2006, carClass: 'B', pi: 655, power: 286, weight: 1410, drivetrain: 'AWD', priceCr: 29000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo 4G63 MIVEC' },
  { brand: 'Mitsubishi', model: 'Lancer Evolution X GSR', year: 2008, carClass: 'B', pi: 660, power: 295, weight: 1590, drivetrain: 'AWD', priceCr: 33000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo 4B11T' },
  { brand: 'Mitsubishi', model: 'Eclipse GSX', year: 1995, carClass: 'B', pi: 620, power: 210, weight: 1430, drivetrain: 'AWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo 4G63' },
  { brand: 'Mitsubishi', model: 'GTO / 3000GT VR-4', year: 1997, carClass: 'B', pi: 645, power: 320, weight: 1710, drivetrain: 'AWD', priceCr: 24000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '3.0L Twin-Turbo V6 6G72' },
  { brand: 'Honda', model: 'Civic Type R (FL5)', year: 2023, carClass: 'B', pi: 675, power: 315, weight: 1430, drivetrain: 'FWD', priceCr: 45000, rarity: 'Hard-to-Find', engineLocation: 'Front', category: 'Hot Hatch', country: 'Japan', engineType: '2.0L Turbo K20C1' },
  { brand: 'Honda', model: 'Civic Type R (FK8)', year: 2018, carClass: 'B', pi: 660, power: 306, weight: 1380, drivetrain: 'FWD', priceCr: 38000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Japan', engineType: '2.0L Turbo K20C1' },
  { brand: 'Honda', model: 'Civic Type R (EK9)', year: 1997, carClass: 'B', pi: 610, power: 182, weight: 1050, drivetrain: 'FWD', priceCr: 20000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Japan', engineType: '1.6L VTEC B16B 8200 RPM' },
  { brand: 'Honda', model: 'S2000 CR', year: 2009, carClass: 'B', pi: 630, power: 237, weight: 1255, drivetrain: 'RWD', priceCr: 35000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.2L VTEC F22C1 8000 RPM' },
  { brand: 'Honda', model: 'Integra Type R (DC2)', year: 2001, carClass: 'B', pi: 625, power: 197, weight: 1145, drivetrain: 'FWD', priceCr: 22000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.8L VTEC B18C' },
  { brand: 'Honda', model: 'NSX', year: 1992, carClass: 'B', pi: 690, power: 270, weight: 1370, drivetrain: 'RWD', priceCr: 90000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'JDM', country: 'Japan', engineType: '3.0L V6 VTEC C30A' },
  { brand: 'Mazda', model: 'RX-7 Spirit R Type-A', year: 2002, carClass: 'B', pi: 645, power: 276, weight: 1270, drivetrain: 'RWD', priceCr: 36000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.3L Twin-Turbo Rotary 13B-REW' },
  { brand: 'Mazda', model: 'RX-8 R3', year: 2011, carClass: 'B', pi: 615, power: 232, weight: 1390, drivetrain: 'RWD', priceCr: 27000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.3L Renesis Rotary 9000 RPM' },
  { brand: 'Mazda', model: 'MX-5 RF', year: 2016, carClass: 'B', pi: 610, power: 155, weight: 1065, drivetrain: 'RWD', priceCr: 32000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Skyactiv-G' },
  { brand: 'Nissan', model: 'Silvia Spec-R (S15)', year: 2000, carClass: 'B', pi: 615, power: 250, weight: 1240, drivetrain: 'RWD', priceCr: 35000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo SR20DET' },
  { brand: 'Nissan', model: 'Silvia K\'s Aero (S14)', year: 1998, carClass: 'B', pi: 605, power: 217, weight: 1250, drivetrain: 'RWD', priceCr: 28000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo SR20DET' },
  { brand: 'Nissan', model: 'Skyline GT-R (R32)', year: 1993, carClass: 'B', pi: 670, power: 276, weight: 1430, drivetrain: 'AWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.6L Twin-Turbo RB26DETT "Godzilla"' },
  { brand: 'Nissan', model: 'Skyline GT-R V-Spec (R33)', year: 1997, carClass: 'B', pi: 685, power: 276, weight: 1530, drivetrain: 'AWD', priceCr: 52000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.6L Twin-Turbo RB26DETT' },
  { brand: 'Ford', model: 'Focus RS', year: 2017, carClass: 'B', pi: 670, power: 350, weight: 1560, drivetrain: 'AWD', priceCr: 40000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'USA', engineType: '2.3L Turbo EcoBoost' },
  { brand: 'Ford', model: 'Sierra Cosworth RS500', year: 1987, carClass: 'B', pi: 630, power: 224, weight: 1207, drivetrain: 'RWD', priceCr: 66000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Retro Supercar', country: 'UK', engineType: '2.0L Turbo Cosworth YBD' },
  { brand: 'Ford', model: 'Escort RS Cosworth', year: 1992, carClass: 'B', pi: 635, power: 224, weight: 1275, drivetrain: 'AWD', priceCr: 50000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Rally', country: 'UK', engineType: '2.0L Turbo Cosworth YBT' },
  { brand: 'Volkswagen', model: 'Golf R', year: 2021, carClass: 'B', pi: 680, power: 315, weight: 1550, drivetrain: 'AWD', priceCr: 48000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Germany', engineType: '2.0L Turbo EA888 Gen 4' },
  { brand: 'Volkswagen', model: 'Golf R32 Mk4', year: 2003, carClass: 'B', pi: 625, power: 237, weight: 1477, drivetrain: 'AWD', priceCr: 24000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Germany', engineType: '3.2L VR6 24V' },
  { brand: 'Renault', model: 'Mégane R.S. Trophy-R', year: 2019, carClass: 'B', pi: 670, power: 296, weight: 1306, drivetrain: 'FWD', priceCr: 58000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'France', engineType: '1.8L Turbo' },
  { brand: 'Renault', model: 'Clio Williams', year: 1993, carClass: 'B', pi: 602, power: 147, weight: 990, drivetrain: 'FWD', priceCr: 30000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'France', engineType: '2.0L 16V F7R' },
  { brand: 'Peugeot', model: '205 Turbo 16', year: 1984, carClass: 'B', pi: 650, power: 197, weight: 1145, drivetrain: 'AWD', priceCr: 200000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Rally', country: 'France', engineType: '1.8L Turbo 16V' },
  { brand: 'Volvo', model: '850 R', year: 1996, carClass: 'B', pi: 615, power: 240, weight: 1440, drivetrain: 'FWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Sweden', engineType: '2.3L Turbo 5-Cyl B5234T4' },
  { brand: 'Buick', model: 'Regal GNX', year: 1987, carClass: 'B', pi: 640, power: 276, weight: 1585, drivetrain: 'RWD', priceCr: 120000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '3.8L Turbo V6' },
  { brand: 'Pontiac', model: 'Firebird Trans Am SD-455', year: 1973, carClass: 'B', pi: 620, power: 310, weight: 1750, drivetrain: 'RWD', priceCr: 75000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '7.5L Super Duty 455 V8' },
  { brand: 'BMW', model: 'M3 (E46)', year: 2005, carClass: 'B', pi: 690, power: 338, weight: 1570, drivetrain: 'RWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Super Saloon', country: 'Germany', engineType: '3.2L S54 8000 RPM' },
  { brand: 'BMW', model: 'M3 (E30)', year: 1991, carClass: 'B', pi: 620, power: 215, weight: 1200, drivetrain: 'RWD', priceCr: 80000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '2.3L S14 4-Cyl' },
  { brand: 'BMW', model: '1 Series M Coupé', year: 2011, carClass: 'B', pi: 695, power: 335, weight: 1495, drivetrain: 'RWD', priceCr: 55000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Track Toy', country: 'Germany', engineType: '3.0L Twin-Turbo N54' },

  // ==========================================
  // CLASS C & D: LIGHTWEIGHTS, RETRO, CLASSICS & DRIFT
  // ==========================================
  { brand: 'Mazda', model: 'MX-5 Miata', year: 1994, carClass: 'C', pi: 510, power: 128, weight: 990, drivetrain: 'RWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.8L BP-ZE' },
  { brand: 'Mazda', model: 'Savanna RX-7 (FC3S)', year: 1990, carClass: 'C', pi: 570, power: 202, weight: 1260, drivetrain: 'RWD', priceCr: 30000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.3L Turbo Rotary 13B' },
  { brand: 'Toyota', model: 'MR2 GT-S (SW20)', year: 1995, carClass: 'C', pi: 580, power: 242, weight: 1280, drivetrain: 'RWD', priceCr: 28000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo 3S-GTE' },
  { brand: 'Toyota', model: 'Celica GT-Four (ST205)', year: 1994, carClass: 'C', pi: 590, power: 252, weight: 1390, drivetrain: 'AWD', priceCr: 30000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Rally', country: 'Japan', engineType: '2.0L Turbo 3S-GTE' },
  { brand: 'Nissan', model: '240SX SE', year: 1993, carClass: 'C', pi: 520, power: 155, weight: 1235, drivetrain: 'RWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.4L KA24DE' },
  { brand: 'Nissan', model: 'Silvia K\'s (S13)', year: 1992, carClass: 'C', pi: 560, power: 202, weight: 1190, drivetrain: 'RWD', priceCr: 27000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.0L Turbo SR20DET' },
  { brand: 'Nissan', model: 'Fairlady 240Z', year: 1969, carClass: 'C', pi: 505, power: 151, weight: 1044, drivetrain: 'RWD', priceCr: 150000, rarity: 'Autoshow', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '2.4L L24 Inline-6' },
  { brand: 'Ford', model: 'Fiesta ST', year: 2014, carClass: 'C', pi: 550, power: 197, weight: 1163, drivetrain: 'FWD', priceCr: 18000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'USA', engineType: '1.6L Turbo EcoBoost' },
  { brand: 'Mini', model: 'John Cooper Works GP', year: 2020, carClass: 'C', pi: 595, power: 301, weight: 1255, drivetrain: 'FWD', priceCr: 38000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'UK', engineType: '2.0L Turbo' },
  { brand: 'Volkswagen', model: 'Corrado VR6', year: 1995, carClass: 'C', pi: 540, power: 188, weight: 1240, drivetrain: 'FWD', priceCr: 20000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Germany', engineType: '2.9L VR6 12V' },
  { brand: 'Alfa Romeo', model: 'Giulia Sprint GTA', year: 1965, carClass: 'C', pi: 515, power: 113, weight: 745, drivetrain: 'RWD', priceCr: 300000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic', country: 'Italy', engineType: '1.6L Twin-Cam Twin-Spark' },
  { brand: 'Alpine', model: 'A110 1600S', year: 1973, carClass: 'C', pi: 525, power: 138, weight: 715, drivetrain: 'RWD', priceCr: 98000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Rally', country: 'France', engineType: '1.6L 4-Cyl' },
  { brand: 'Lancia', model: 'Fulvia Coupé 1.6 HF', year: 1968, carClass: 'C', pi: 502, power: 113, weight: 850, drivetrain: 'FWD', priceCr: 45000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Rally', country: 'Italy', engineType: '1.6L Narrow-Angle V4' },
  { brand: 'Chevrolet', model: 'Camaro Super Sport Coupe', year: 1969, carClass: 'C', pi: 560, power: 300, weight: 1530, drivetrain: 'RWD', priceCr: 110000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '5.7L 350 V8' },
  { brand: 'Pontiac', model: 'GTO The Judge', year: 1969, carClass: 'C', pi: 575, power: 366, weight: 1675, drivetrain: 'RWD', priceCr: 70000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '6.6L Ram Air IV 400 V8' },
  { brand: 'Dodge', model: 'Charger R/T', year: 1969, carClass: 'C', pi: 580, power: 425, weight: 1785, drivetrain: 'RWD', priceCr: 103000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '7.0L 426 HEMI V8' },
  { brand: 'Ford', model: 'Mustang Boss 302', year: 1969, carClass: 'C', pi: 570, power: 290, weight: 1460, drivetrain: 'RWD', priceCr: 230000, rarity: 'Barn Find', engineLocation: 'Front', category: 'Classic Muscle', country: 'USA', engineType: '5.0L Boss 302 V8' },

  // Class D & E
  { brand: 'Toyota', model: 'Sprinter Trueno GT-Apex (AE86)', year: 1985, carClass: 'D', pi: 420, power: 128, weight: 950, drivetrain: 'RWD', priceCr: 25000, rarity: 'Wheelspin', engineLocation: 'Front', category: 'JDM', country: 'Japan', engineType: '1.6L 4A-GE DOHC 16V' },
  { brand: 'Volkswagen', model: 'Golf GTI Mk1', year: 1983, carClass: 'D', pi: 380, power: 110, weight: 840, drivetrain: 'FWD', priceCr: 20000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'Germany', engineType: '1.8L 8V DX' },
  { brand: 'Volkswagen', model: 'Beetle 1200', year: 1963, carClass: 'D', pi: 310, power: 40, weight: 730, drivetrain: 'RWD', priceCr: 15000, rarity: 'Barn Find', engineLocation: 'Rear', category: 'Classic', country: 'Germany', engineType: '1.2L Air-Cooled Flat-4' },
  { brand: 'Renault', model: '5 Turbo', year: 1980, carClass: 'D', pi: 490, power: 158, weight: 970, drivetrain: 'RWD', priceCr: 120000, rarity: 'Autoshow', engineLocation: 'Mid', category: 'Hot Hatch', country: 'France', engineType: '1.4L Turbo Cleon-Fonte' },
  { brand: 'Peugeot', model: '205 GTI', year: 1984, carClass: 'D', pi: 440, power: 104, weight: 850, drivetrain: 'FWD', priceCr: 20000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Hot Hatch', country: 'France', engineType: '1.6L XU5J' },
  { brand: 'Ford', model: 'Capri RS3100', year: 1973, carClass: 'D', pi: 450, power: 148, weight: 1050, drivetrain: 'RWD', priceCr: 55000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic', country: 'UK', engineType: '3.1L Essex V6' },
  { brand: 'Datsun', model: '510', year: 1970, carClass: 'D', pi: 390, power: 96, weight: 965, drivetrain: 'RWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic', country: 'Japan', engineType: '1.6L L16' },
  { brand: 'Volvo', model: '242 Turbo Evolution', year: 1983, carClass: 'D', pi: 480, power: 175, weight: 1290, drivetrain: 'RWD', priceCr: 35000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic', country: 'Sweden', engineType: '2.1L Turbo B21ET' },
  { brand: 'Mini', model: 'Cooper S', year: 1965, carClass: 'E', pi: 290, power: 75, weight: 670, drivetrain: 'FWD', priceCr: 30000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Classic', country: 'UK', engineType: '1.3L A-Series' },
  { brand: 'Fiat', model: '500 F', year: 1968, carClass: 'E', pi: 210, power: 18, weight: 510, drivetrain: 'RWD', priceCr: 25000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Classic', country: 'Italy', engineType: '0.5L 2-Cyl' },
  { brand: 'Ford', model: 'De Luxe Five-Window Coupe', year: 1932, carClass: 'D', pi: 320, power: 65, weight: 1100, drivetrain: 'RWD', priceCr: 35000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Vintage Racer', country: 'USA', engineType: '3.6L Flathead V8' },

  // ==========================================
  // OFF-ROAD & EXTREME CROSS-COUNTRY BEASTS
  // ==========================================
  { brand: 'Ford', model: 'F-150 Raptor R', year: 2023, carClass: 'A', pi: 710, power: 700, weight: 2690, drivetrain: 'AWD', priceCr: 110000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'USA', engineType: '5.2L Supercharged Predator V8' },
  { brand: 'Ford', model: 'Bronco Badlands', year: 2021, carClass: 'B', pi: 610, power: 315, weight: 2250, drivetrain: 'AWD', priceCr: 55000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'USA', engineType: '2.7L Twin-Turbo EcoBoost V6' },
  { brand: 'Jeep', model: 'Wrangler Rubicon', year: 2012, carClass: 'C', pi: 510, power: 285, weight: 1900, drivetrain: 'AWD', priceCr: 40000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'USA', engineType: '3.6L Pentastar V6' },
  { brand: 'Land Rover', model: 'Defender 110 V8', year: 2021, carClass: 'A', pi: 705, power: 518, weight: 2600, drivetrain: 'AWD', priceCr: 105000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'UK', engineType: '5.0L Supercharged V8' },
  { brand: 'Can-Am', model: 'Maverick X3 X RS Turbo R', year: 2018, carClass: 'B', pi: 620, power: 172, weight: 720, drivetrain: 'AWD', priceCr: 35000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Off-road', country: 'Canada', engineType: '0.9L Turbo Rotax 3-Cyl' },
  { brand: 'Ariel', model: 'Nomad', year: 2016, carClass: 'A', pi: 740, power: 235, weight: 670, drivetrain: 'RWD', priceCr: 93000, rarity: 'Autoshow', engineLocation: 'Rear', category: 'Off-road', country: 'UK', engineType: '2.4L Honda K24' },
  { brand: 'DeBerti', model: 'Ford F-150 "Prerunner"', year: 2018, carClass: 'A', pi: 750, power: 800, weight: 2200, drivetrain: 'RWD', priceCr: 250000, rarity: 'Autoshow', engineLocation: 'Front', category: 'Off-road', country: 'USA', engineType: '5.0L Supercharged V8' }
];

export const CAR_DATABASE = CAR_CATALOG;

// Helpful Pack Pre-sets for 1-click batch import into User Garage
export const CAR_PACKS = [
  {
    id: 'jdm_legends',
    name: 'JDM Tuner Legends Pack',
    description: 'Iconic Japanese performance royalty: Supra RZ, R34 GT-R, RX-7 Spirit R, NSX-R, EVO IX, Impreza 22B & AE86.',
    count: 10,
    filter: (car: CatalogCar) => ['Supra RZ (A80)', 'Skyline GT-R V-Spec II (R34)', 'RX-7 Spirit R Type-A', 'NSX-R GT', 'Lancer Evolution IX MR', 'Impreza 22B STi', 'Sprinter Trueno GT-Apex (AE86)', 'Silvia Spec-R (S15)', 'S2000 CR', 'Fairlady 240Z'].includes(car.model)
  },
  {
    id: 'hypercar_titans',
    name: 'Class S2 / X Hypercar Titans',
    description: 'Top-tier pinnacle speed and downforce: Valkyrie, AMG ONE, Jesko, Senna, Chiron, Nevera, LaFerrari & 918 Spyder.',
    count: 8,
    filter: (car: CatalogCar) => ['Valkyrie', 'Mercedes-AMG ONE', 'Jesko', 'Senna', 'Chiron', 'Nevera', 'LaFerrari', '918 Spyder'].includes(car.model)
  },
  {
    id: 'track_weapons',
    name: 'GT & Track Toys Weaponry',
    description: 'Circuit-dominating apex slicers: 911 GT3 RS 992, Corvette Z06 C8, Viper ACR, Huracán STO & 488 Pista.',
    count: 6,
    filter: (car: CatalogCar) => ['911 GT3 RS (992)', 'Corvette Z06 (C8)', 'Viper ACR', 'Huracán STO', '488 Pista', 'GT Black Series'].includes(car.model)
  },
  {
    id: 'muscle_icons',
    name: 'American Muscle & Big V8s',
    description: 'V8 roar and straight-line torque: Mustang Dark Horse, GT500, Challenger Demon, Corvette ZR1 & Cobra 427.',
    count: 6,
    filter: (car: CatalogCar) => ['Mustang Dark Horse', 'GT500 (S550)', 'Challenger SRT Demon', 'Camaro ZL1 1LE', 'Cobra 427 S/C', 'Corvette ZR1 (C7)'].includes(car.model)
  },
  {
    id: 'rally_monsters',
    name: 'Group B & WRC Rally Legends',
    description: 'All-surface all-wheel-drive gravel masters: Audi Sport Quattro, Lancia Delta Integrale, 037, Stratos & Cossie V2.',
    count: 6,
    filter: (car: CatalogCar) => ['Sport Quattro', 'Delta HF Integrale EVO', '037 Stradale', 'Stratos HF', 'Ford Escort RS Cosworth "Cossie V2"', 'Celica GT-Four (ST205)'].includes(car.model)
  },
  {
    id: 'full_roster',
    name: 'Full Forza Franchise Starter (Top 25)',
    description: 'Curated cross-section of the 25 most revered vehicles across all franchise classes and categories.',
    count: 25,
    filter: (_car: CatalogCar, index: number) => index % 4 === 0
  }
];
