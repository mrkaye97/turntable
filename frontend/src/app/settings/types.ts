export type AssetExclusionFilter = {
  filter_name_contains: string;
  count: number;
};

export type Settings = {
  exclusion_filters: AssetExclusionFilter[];
};
