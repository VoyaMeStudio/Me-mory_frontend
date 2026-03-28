export type GetMyPageResponse = {
  code: number;
  message: string;
  data: {
    user: {
      userId: number;
      profileImageUrl: string | null;
      surName: string;
      firstName: string;
      koreanName: string;
      birth: string;
      nationality: string;
    };
    statistics: {
      countryCount: number;
      diaryCount: number;
    };
    flags: string;
  };
};

export type GetVisitedCountriesResponse = {
  code: number;
  message: string;
  data: {
    countryCount: number;
    visitedCountries: {
      countryCode: string;
      countryName: string;
    }[];
  };
};

export type MypageUser = {
  userId: number;
  profileImageUrl: string | null;
  surName: string;
  firstName: string;
  koreanName: string;
  birth: string;
  nationality: string;
};

export type MypageStatistics = {
  countryCount: number;
  diaryCount: number;
};

export type VisitedCountry = {
  countryCode: string;
  countryName: string;
  flag: string;
};

export type MypageData = {
  user: MypageUser;
  statistics: MypageStatistics;
  flags: string;
};

export type UseMypageResult = {
  mypage: MypageData | null;
  visitedCountries: VisitedCountry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};