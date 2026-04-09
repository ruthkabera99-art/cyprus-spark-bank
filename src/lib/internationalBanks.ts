export interface InternationalBank {
  name: string;
  swiftCode: string;
  country: string;
  countryCode: string;
}

export const internationalBanks: InternationalBank[] = [
  // United States
  { name: "JPMorgan Chase", swiftCode: "CHASUS33", country: "United States", countryCode: "US" },
  { name: "Bank of America", swiftCode: "BOFAUS3N", country: "United States", countryCode: "US" },
  { name: "Wells Fargo", swiftCode: "WFBIUS6S", country: "United States", countryCode: "US" },
  { name: "Citibank", swiftCode: "CITIUS33", country: "United States", countryCode: "US" },
  { name: "Goldman Sachs", swiftCode: "GSCMUS33", country: "United States", countryCode: "US" },
  // United Kingdom
  { name: "HSBC", swiftCode: "HSBCGB2L", country: "United Kingdom", countryCode: "GB" },
  { name: "Barclays", swiftCode: "BARCGB22", country: "United Kingdom", countryCode: "GB" },
  { name: "Lloyds Banking Group", swiftCode: "LOYDGB2L", country: "United Kingdom", countryCode: "GB" },
  { name: "Standard Chartered", swiftCode: "SCBLGB2L", country: "United Kingdom", countryCode: "GB" },
  { name: "NatWest", swiftCode: "NWBKGB2L", country: "United Kingdom", countryCode: "GB" },
  // Germany
  { name: "Deutsche Bank", swiftCode: "DEUTDEFF", country: "Germany", countryCode: "DE" },
  { name: "Commerzbank", swiftCode: "COBADEFF", country: "Germany", countryCode: "DE" },
  { name: "DZ Bank", swiftCode: "GENODEFF", country: "Germany", countryCode: "DE" },
  // France
  { name: "BNP Paribas", swiftCode: "BNPAFRPP", country: "France", countryCode: "FR" },
  { name: "Société Générale", swiftCode: "SOGEFRPP", country: "France", countryCode: "FR" },
  { name: "Crédit Agricole", swiftCode: "AGRIFRPP", country: "France", countryCode: "FR" },
  // Switzerland
  { name: "UBS", swiftCode: "UBSWCHZH", country: "Switzerland", countryCode: "CH" },
  { name: "Credit Suisse", swiftCode: "CRESCHZZ", country: "Switzerland", countryCode: "CH" },
  // Japan
  { name: "Mitsubishi UFJ", swiftCode: "BOTKJPJT", country: "Japan", countryCode: "JP" },
  { name: "Sumitomo Mitsui", swiftCode: "SMBCJPJT", country: "Japan", countryCode: "JP" },
  { name: "Mizuho Bank", swiftCode: "MHCBJPJT", country: "Japan", countryCode: "JP" },
  // China
  { name: "Industrial & Commercial Bank of China", swiftCode: "ICBKCNBJ", country: "China", countryCode: "CN" },
  { name: "Bank of China", swiftCode: "BKCHCNBJ", country: "China", countryCode: "CN" },
  { name: "China Construction Bank", swiftCode: "PCBCCNBJ", country: "China", countryCode: "CN" },
  // Canada
  { name: "Royal Bank of Canada", swiftCode: "ROYCCAT2", country: "Canada", countryCode: "CA" },
  { name: "Toronto-Dominion Bank", swiftCode: "TDOMCATT", country: "Canada", countryCode: "CA" },
  { name: "Bank of Montreal", swiftCode: "BOFMCAT2", country: "Canada", countryCode: "CA" },
  // Australia
  { name: "Commonwealth Bank", swiftCode: "CTBAAU2S", country: "Australia", countryCode: "AU" },
  { name: "Westpac", swiftCode: "WPACAU2S", country: "Australia", countryCode: "AU" },
  { name: "ANZ Bank", swiftCode: "ANZBAU3M", country: "Australia", countryCode: "AU" },
  // Singapore
  { name: "DBS Bank", swiftCode: "DBSSSGSG", country: "Singapore", countryCode: "SG" },
  { name: "OCBC Bank", swiftCode: "OCBCSGSG", country: "Singapore", countryCode: "SG" },
  { name: "United Overseas Bank", swiftCode: "UOVBSGSG", country: "Singapore", countryCode: "SG" },
  // UAE
  { name: "Emirates NBD", swiftCode: "EABORSDXXX", country: "UAE", countryCode: "AE" },
  { name: "Abu Dhabi Commercial Bank", swiftCode: "ADCBAEAA", country: "UAE", countryCode: "AE" },
  // India
  { name: "State Bank of India", swiftCode: "SBININBB", country: "India", countryCode: "IN" },
  { name: "HDFC Bank", swiftCode: "HDFCINBB", country: "India", countryCode: "IN" },
  { name: "ICICI Bank", swiftCode: "ABORINBB", country: "India", countryCode: "IN" },
  // Brazil
  { name: "Itaú Unibanco", swiftCode: "ITAUBRSP", country: "Brazil", countryCode: "BR" },
  { name: "Banco do Brasil", swiftCode: "BRASBRRJ", country: "Brazil", countryCode: "BR" },
  // South Africa
  { name: "Standard Bank", swiftCode: "SBZAZAJJ", country: "South Africa", countryCode: "ZA" },
  { name: "FirstRand Bank", swiftCode: "FIRNZAJJ", country: "South Africa", countryCode: "ZA" },
  // South Korea
  { name: "KB Kookmin Bank", swiftCode: "CZNBKRSE", country: "South Korea", countryCode: "KR" },
  { name: "Shinhan Bank", swiftCode: "SHBKKRSE", country: "South Korea", countryCode: "KR" },
  // Mexico
  { name: "BBVA Mexico", swiftCode: "BCMRMXMM", country: "Mexico", countryCode: "MX" },
  { name: "Banorte", swiftCode: "MENOMXMT", country: "Mexico", countryCode: "MX" },
  // Nigeria
  { name: "First Bank of Nigeria", swiftCode: "FBNINGLA", country: "Nigeria", countryCode: "NG" },
  { name: "Guaranty Trust Bank", swiftCode: "GTBINGLA", country: "Nigeria", countryCode: "NG" },
  { name: "Zenith Bank", swiftCode: "ZEABORSDXXX", country: "Nigeria", countryCode: "NG" },
  // Kenya
  { name: "Kenya Commercial Bank", swiftCode: "KCBLKENX", country: "Kenya", countryCode: "KE" },
  { name: "Equity Bank", swiftCode: "EABORSDXKE", country: "Kenya", countryCode: "KE" },
  // Cyprus
  { name: "Bank of Cyprus", swiftCode: "BCYPCY2N", country: "Cyprus", countryCode: "CY" },
  { name: "Hellenic Bank", swiftCode: "HEBACY2N", country: "Cyprus", countryCode: "CY" },
  // Italy
  { name: "UniCredit", swiftCode: "UNCRITMM", country: "Italy", countryCode: "IT" },
  { name: "Intesa Sanpaolo", swiftCode: "BCITITMM", country: "Italy", countryCode: "IT" },
  // Spain
  { name: "Santander", swiftCode: "BSCHESMM", country: "Spain", countryCode: "ES" },
  { name: "CaixaBank", swiftCode: "CABORSDXXX", country: "Spain", countryCode: "ES" },
  // Netherlands
  { name: "ING Group", swiftCode: "INGBNL2A", country: "Netherlands", countryCode: "NL" },
  { name: "ABN AMRO", swiftCode: "ABNANL2A", country: "Netherlands", countryCode: "NL" },
  // Sweden
  { name: "Nordea", swiftCode: "NDEASESS", country: "Sweden", countryCode: "SE" },
  { name: "SEB", swiftCode: "ESSESESS", country: "Sweden", countryCode: "SE" },
  // Turkey
  { name: "Garanti BBVA", swiftCode: "TGBATRIS", country: "Turkey", countryCode: "TR" },
  { name: "İş Bankası", swiftCode: "ISBKTRIS", country: "Turkey", countryCode: "TR" },
  // Saudi Arabia
  { name: "Saudi National Bank", swiftCode: "NCBKSAJE", country: "Saudi Arabia", countryCode: "SA" },
  { name: "Al Rajhi Bank", swiftCode: "RJHISARI", country: "Saudi Arabia", countryCode: "SA" },
  // Philippines
  { name: "BDO Unibank", swiftCode: "ABORSDPHXXX", country: "Philippines", countryCode: "PH" },
  { name: "Bank of the Philippine Islands", swiftCode: "BABORSDPHXX", country: "Philippines", countryCode: "PH" },
  // Russia
  { name: "Sberbank", swiftCode: "SABRRUMM", country: "Russia", countryCode: "RU" },
  // Qatar
  { name: "Qatar National Bank", swiftCode: "QNBAQAQA", country: "Qatar", countryCode: "QA" },
  // Egypt
  { name: "National Bank of Egypt", swiftCode: "NBEGEGCX", country: "Egypt", countryCode: "EG" },
  // Malaysia
  { name: "Maybank", swiftCode: "MABORSDXKL", country: "Malaysia", countryCode: "MY" },
  { name: "CIMB Bank", swiftCode: "CIBBMYKL", country: "Malaysia", countryCode: "MY" },
  // Thailand
  { name: "Bangkok Bank", swiftCode: "BKABORSDXX", country: "Thailand", countryCode: "TH" },
  { name: "Kasikornbank", swiftCode: "KASITHBK", country: "Thailand", countryCode: "TH" },
  // Indonesia
  { name: "Bank Central Asia", swiftCode: "CENAIDJA", country: "Indonesia", countryCode: "ID" },
  { name: "Bank Mandiri", swiftCode: "BMRIIDJA", country: "Indonesia", countryCode: "ID" },
  // Pakistan
  { name: "Habib Bank", swiftCode: "HABORSDXXX", country: "Pakistan", countryCode: "PK" },
  // Ghana
  { name: "Ghana Commercial Bank", swiftCode: "GHCBGHAC", country: "Ghana", countryCode: "GH" },
  // Tanzania
  { name: "CRDB Bank", swiftCode: "CORUTZTZ", country: "Tanzania", countryCode: "TZ" },
  // Vietnam
  { name: "Vietcombank", swiftCode: "BFTVVNVX", country: "Vietnam", countryCode: "VN" },
];

export const countries = [...new Set(internationalBanks.map(b => b.country))].sort();

export function getBanksByCountry(country: string): InternationalBank[] {
  return internationalBanks.filter(b => b.country === country);
}
