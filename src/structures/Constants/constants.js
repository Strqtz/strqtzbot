export const skillXPPerLevel = [
  0, 50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000,
  15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000, 400000, 500000,
  600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000,
  1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000,
  2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000, 3400000,
  3700000, 4000000, 4300000, 4600000, 4900000, 5200000, 5500000, 5800000,
  6100000, 6400000, 6700000, 7000000,
];

export const catacombsExpPerLevel = [
  50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260, 7380,
  10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000, 132000, 180000,
  243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000, 2500000,
  3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000, 19000000,
  24000000, 30000000, 38000000, 48000000, 60000000, 75000000, 93000000,
  116250000,
];

export function getLevelFromXP(xp) {
  let xpAdded = 0;
  for (let i = 0; i < 61; i++) {
    xpAdded += skillXPPerLevel[i];
    if (xp < xpAdded)
      return Math.floor(
        i - 1 + (xp - (xpAdded - skillXPPerLevel[i])) / skillXPPerLevel[i]
      );
  }

  return 60;
}
export function getCataFromExp(xp) {
  let xpAdded = 0;
  for (let i = 0; i < 61; i++) {
    xpAdded += catacombsExpPerLevel[i];
    if (xp < xpAdded)
      return Math.floor(
        i -
          1 +
          (xp - (xpAdded - catacombsExpPerLevel[i])) / catacombsExpPerLevel[i]
      );
  }

  return 50;
}

export function cataExpProgress(xp) {}

export function removeUnderscorePlus(string) {
  return string.replace(`_PLUS`, "+");
}

export const getActiveProfile = function (profiles, uuid) {
  return profiles.sort(
    (a, b) => b.members[uuid].last_save - a.members[uuid].last_save
  )[0];
};

export const getActiveProfileCuteName = function (profiles, uuid) {
  return profiles.sort(
    (a, b) => b.members[uuid].last_save - a.members[uuid].last_save
  )[0].cute_name;
};

export function ObjectLength(object) {
  return Object.keys(object).length;
}

export function getTotalScore(exploration, speed, skill, bonus) {
  let grade;
  const total = exploration + speed + skill + bonus;
  if (total <= 99) {
    grade = "D";
  } else if (total >= 100 && total <= 159) {
    grade = "C";
  } else if (total >= 160 && total <= 229) {
    grade = "B";
  } else if (total >= 230 && total <= 269) {
    grade = "A";
  } else if (total >= 270 && total <= 299) {
    grade = "S";
  } else if (total >= 300) {
    grade = "S+";
  }
  return [total, grade];
}

export const online = {
  true: "Online",
  false: "Offline",
};
