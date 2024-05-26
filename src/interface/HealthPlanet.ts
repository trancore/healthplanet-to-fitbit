interface OauthAuthResponseInterface {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

interface StatusInnerscanRequestInterface {
  /**
   * /oauth/token にて取得したトークン
   */
  access_token: string;
  /**
   * from to の日付タイプを指定する。
   * 0 : 登録日付
   * 1 : 測定日付
   */
  date: "0" | "1";
  /**
   * 取得期間 from を指定する。yyyyMMddHHmmss 形式で指定し、必ず from < to でなければならない
   * 未指定の場合は3ヶ月前が指定される
   */
  from: string;
  /**
   * 取得期間 to を指定する。yyyyMMddHHmmss 形式で指定し、必ず from < to でなければならない
   * 未指定の場合は現時刻が指定される
   */
  to: string;
  /**
   * 取得する測定部位を指定する。未指定の場合はデフォルトの値を取得する。カンマ区切りで指定する
   * 6021 : 体重 (kg)
   * 6022 : 体脂肪率 (%)
   */
  tag: "6021,6022";
}

interface StatusInnerscanResponsetInterface {
  /**
   * 誕生日
   */
  birth_date: string;
  /**
   * 身長
   */
  height: string;
  /**
   * 性別
   */
  sex: string;
  /** データ */
  data: {
    /**
     * 測定日付
     */
    date: string;
    /**
     * 測定データ
     */
    keydata: string;
    /**
     * 測定機器名
     */
    model: string;
    /**
     * 測定部位
     * 6021: 体重(kg)
     * 6022: 体脂肪率(%)
     */
    tag: "6021" | "6022";
  }[];
}
