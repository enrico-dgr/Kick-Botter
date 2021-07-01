enum EnumOfBots {
  Socialgift = "Socialgift",
}
export type Bots = keyof typeof EnumOfBots;
export type SettingsByBotChoice<TypeOfSettings> = {
  [key in Bots]: TypeOfSettings;
};
export const getPropertiesFromSettingsAndBotChoice: <
  TypeOfProperties,
  TypeOfSettings
>(
  getPropertiesFromSettings: (g: TypeOfSettings) => TypeOfProperties
) => (
  settingsByBotChoice: SettingsByBotChoice<TypeOfSettings>
) => (bot: Bots) => TypeOfProperties = (getPropertiesFromSettings) => (
  settingsByBotChoice
) => (bot) => getPropertiesFromSettings(settingsByBotChoice[bot]);
