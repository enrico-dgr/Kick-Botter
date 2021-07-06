import * as React from 'react';

type GenericSettings = {
  [k: string]: number | string | boolean | GenericSettings;
};
/**
 *
 */
type Props<Settings extends GenericSettings> = {
  settings: Settings;
  onChange?: (settings: Settings) => void;
};
/**
 *
 */
type RenderedSetting<
  Settings extends GenericSettings
> = React.FunctionComponentElement<Props<Settings>>;
/**
 *
 */
export const DisplaySettings = <Settings extends GenericSettings>(
  props: Props<Settings>
): RenderedSetting<Settings> => {
  /**
   * Change not-object property by providing an array of keys
   * of the nested objects and property.
   */
  const setStateOfSettings = (
    setting: string | number | boolean,
    keys: string[]
  ): void => {
    /**
     *
     */
    const mutateRecur = <S extends GenericSettings>(
      keys: string[],
      nested: S
    ): S => {
      const numberOfKeys = keys.length;

      if (numberOfKeys < 1)
        throw new Error("No keys' map found to update setting.");
      if (typeof nested !== "object") {
        throw new Error("Nested property of Settings is not an object");
      }
      const getNewNested = () => {
        const newNested = nested[keys[0]];
        if (typeof newNested !== "object")
          throw new Error(
            "Nested property is not an object, but one or more keys are provided."
          );
        return newNested;
      };
      return {
        ...nested,
        [keys[0]]:
          numberOfKeys === 1
            ? setting
            : mutateRecur<GenericSettings>(keys.slice(1), getNewNested()),
      };
    };
    /**
     *
     */
    if (props.onChange) props.onChange(mutateRecur(keys, props.settings));
  };
  /**
   * Renderer
   */
  const display = (
    settings: GenericSettings = {},
    map: string[] = []
  ): RenderedSetting<Settings>[] => {
    /**
     * util
     */
    const match = <A, B, C>(
      onBoolean: (b: boolean) => A,
      onNumber: (n: number) => B,
      onString: (s: string) => C
    ) => (thisSetting: string | boolean | number) => {
      switch (typeof thisSetting) {
        case "boolean":
          return onBoolean(thisSetting);
        case "string":
          return onString(thisSetting);
        case "number":
          return onNumber(thisSetting);
      }
    };
    /**
     *
     */
    let buffer: RenderedSetting<Settings>[] = [];
    /**
     * Display recursively
     */
    Object.keys(settings ?? {}).forEach((key) => {
      let setting = settings[key];
      const mapOfKeys = [...map, key];

      if (typeof setting === "object") {
        /**
         * New list at object (notice, this works for arrays too
         * with numbered properties)
         */
        buffer.push(
          <ul key={mapOfKeys.toString()}>
            {key}: {display(setting, mapOfKeys)}
          </ul>
        );
      } else {
        /**
         * List property
         */
        buffer.push(
          <li key={key}>
            {key}:
            {
              <input
                //
                type={match(
                  (_b) => "checkbox",
                  (_n) => "number",
                  (_s) => "text"
                )(setting)}
                // value
                {...{
                  [match(
                    (_b) => "checked",
                    (_n) => `value`,
                    (_s) => `value`
                  )(setting)]: setting,
                }}
                //
                onChange={(e) =>
                  setStateOfSettings(
                    match(
                      (_b) => e.target.checked,
                      (_n) => Number(e.target.value),
                      (_s) => e.target.value
                    )(
                      typeof setting !== "object"
                        ? setting
                        : (() => {
                            throw new Error(
                              "Setting cannot be an object when updating state."
                            );
                          })()
                    ),
                    mapOfKeys
                  )
                }
              />
            }
          </li>
        );
      }
    });
    /**
     *
     */
    return buffer;
  };
  /**
   *
   */
  return <ul>{display(props.settings)}</ul>;
};
