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
  hasOfficialSource: boolean;
  officialUrl?: string;
  officialSourceName?: string;
  segment?: string;
};

function normalizeCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|（.*?）/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .replace(/股份有限公司|有限责任公司|有限公司|集团股份|集团公司|集团|公司/g, "")
    .replace(/co\.?ltd|co\.?,?ltd|co ltd|co,ltd|limited|holdings|technology|technologies|energy|solar|photovoltaic/gi, "");
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

export const historicalCompanyRegistry: RegisteredHistoricalCompany[] = historicalExhibitors.map((item) => {
  const source = findMatchingOfficialSource(item.company, item.companyEn);

  return {
    company: item.company,
    companyEn: item.companyEn,
    hall: item.hall,
    booth: item.booth,
    hasOfficialSource: Boolean(source),
    officialUrl: source?.url,
    officialSourceName: source?.sourceName,
    segment: source?.segment,
  };
});

export const uncoveredHistoricalCompanies = historicalCompanyRegistry.filter((item) => !item.hasOfficialSource);

export const registryStats: RegistryStats = {
  historicalCount: historicalCompanyRegistry.length,
  officialCount: historicalCompanyRegistry.filter((item) => item.hasOfficialSource).length,
  uncoveredCount: uncoveredHistoricalCompanies.length,
  platformCount: 0,
  coverageRate: historicalCompanyRegistry.length
    ? Math.round((historicalCompanyRegistry.filter((item) => item.hasOfficialSource).length / historicalCompanyRegistry.length) * 100)
    : 0,
};
