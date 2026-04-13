import { companySources } from "@/lib/expo-company-sources";
import { historicalExhibitors } from "@/lib/historical-exhibitors";

export type RegistryStats = {
  historicalCount: number;
  officialCount: number;
  uncoveredCount: number;
  platformCount: number;
  coverageRate: number;
};

export type RegisteredHistoricalCompany = {
  company: string;
  companyEn: string;
  hall: string;
  booth: string;
  boothType: string;
  area: string;
  hasOfficialSource: boolean;
  officialUrl?: string;
  officialSourceName?: string;
  segment?: string;
  candidateUrls: string[];
  priority: "高优先" | "中优先" | "普通";
};

function normalizeCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|（.*?）/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .replace(/股份有限公司|有限责任公司|有限公司|集团股份|集团公司|集团|公司/g, "")
    .replace(/co\.?ltd|co\.?,?ltd|co ltd|co,ltd|limited|holdings|technology|technologies|energy|solar|photovoltaic/gi, "");
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function findMatchingOfficialSource(company: string, companyEn: string) {
  const aliases = [company, companyEn, normalizeCompanyName(company), normalizeCompanyName(companyEn)]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  return (
    companySources.find((source) => {
      const sourceAliases = [
        source.company,
        ...source.matchers,
        normalizeCompanyName(source.company),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return aliases.some((alias) => sourceAliases.some((candidate) => alias.includes(candidate) || candidate.includes(alias)));
    }) ?? null
  );
}

function buildDomainTokens(company: string, companyEn: string) {
  const englishBase = companyEn
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\b(co|ltd|limited|inc|corp|corporation|technology|technologies|energy|solar|photovoltaic|new|materials|international)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const englishJoined = englishBase.replace(/\s+/g, "");
  const englishHyphen = englishBase.replace(/\s+/g, "-");
  const englishParts = englishBase.split(" ").filter((part) => part.length >= 3);
  const chinesePinyinHint = normalizeCompanyName(company);

  return uniqueStrings([
    englishJoined,
    englishHyphen,
    englishParts.slice(0, 2).join(""),
    englishParts.slice(0, 2).join("-"),
    englishParts.at(0) ?? "",
    chinesePinyinHint,
  ]).filter((token) => token.length >= 4);
}

function buildCandidateUrls(company: string, companyEn: string) {
  const tokens = buildDomainTokens(company, companyEn).slice(0, 3);
  const urls = tokens.flatMap((token) => [
    `https://www.${token}.com`,
    `https://${token}.com`,
    `https://www.${token}.cn`,
    `https://${token}.cn`,
  ]);

  return uniqueStrings(urls).slice(0, 4);
}

function parseArea(area: string) {
  const value = Number.parseFloat(area);
  return Number.isFinite(value) ? value : 0;
}

function inferPriority(hall: string, area: string): RegisteredHistoricalCompany["priority"] {
  const areaValue = parseArea(area);
  const hallPrefix = hall.toUpperCase();

  if (areaValue >= 180 || /^E[1-3]$/.test(hallPrefix)) return "高优先";
  if (areaValue >= 90 || /^E/.test(hallPrefix)) return "中优先";
  return "普通";
}

export const historicalCompanyRegistry: RegisteredHistoricalCompany[] = historicalExhibitors.map((item) => {
  const source = findMatchingOfficialSource(item.company, item.companyEn);

  return {
    company: item.company,
    companyEn: item.companyEn,
    hall: item.hall,
    booth: item.booth,
    boothType: item.boothType,
    area: item.area,
    hasOfficialSource: Boolean(source),
    officialUrl: source?.url,
    officialSourceName: source?.sourceName,
    segment: source?.segment,
    candidateUrls: source ? [source.url] : buildCandidateUrls(item.company, item.companyEn),
    priority: inferPriority(item.hall, item.area),
  };
});

export const uncoveredHistoricalCompanies = historicalCompanyRegistry
  .filter((item) => !item.hasOfficialSource)
  .sort((a, b) => {
    const priorityWeight = { 高优先: 3, 中优先: 2, 普通: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority] || parseArea(b.area) - parseArea(a.area);
  });

export const registryStats: RegistryStats = {
  historicalCount: historicalCompanyRegistry.length,
  officialCount: historicalCompanyRegistry.filter((item) => item.hasOfficialSource).length,
  uncoveredCount: uncoveredHistoricalCompanies.length,
  platformCount: 0,
  coverageRate: historicalCompanyRegistry.length
    ? Math.round((historicalCompanyRegistry.filter((item) => item.hasOfficialSource).length / historicalCompanyRegistry.length) * 100)
    : 0,
};
