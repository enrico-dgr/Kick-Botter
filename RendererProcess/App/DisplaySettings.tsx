import * as React from 'react';

type GenericSettings =
  | number
  | string
  | boolean
  | RecordGenericSettings
  | Array<GenericSettings>;

type RecordGenericSettings = {
  [k: string]: GenericSettings;
};
/**
 *
 */
type Props<Settings extends RecordGenericSettings> = {
  settings: Settings;
  onChange?: (settings: Settings) => void;
};
/**
 *
 */
type RenderedSetting<
  Settings extends RecordGenericSettings
> = React.FunctionComponentElement<Props<Settings>>;
/**
 *
 */
export const DisplaySettings = <Settings extends RecordGenericSettings>(
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

      const returnArray = (
        nested_: S[],
        setting_: string | number | boolean,
        numberOfKeys_: number
      ) => {
        const index = Number(keys[0]);
        const getNewNested = () => {
          const newNested = nested_[index];
          if (numberOfKeys < 2) {
            return newNested;
          } else {
            if (typeof newNested !== "object")
              throw new Error(
                "Nested property is not an object, but one or more keys are provided."
              );
            return mutateRecur<S>(keys.slice(1), newNested);
          }
        };
        return [
          ...nested_.slice(0, index),
          numberOfKeys_ === 1 ? setting_ : getNewNested(),
          ...nested_.slice(index + 1),
        ];
      };
      const returnObject = (
        nested_: Record<string, S>,
        setting_: string | number | boolean,
        numberOfKeys_: number
      ) => {
        const getNewNested = () => {
          const newNested = nested_[keys[0]];
          if (numberOfKeys < 2) {
            return newNested;
          } else {
            if (typeof newNested !== "object")
              throw new Error(
                "Nested property is not an object, but one or more keys are provided."
              );
            return mutateRecur<S>(keys.slice(1), newNested);
          }
        };
        return {
          ...nested_,
          [keys[0]]: numberOfKeys_ === 1 ? setting_ : getNewNested(),
        };
      };

      return Array.isArray(nested)
        ? (returnArray(nested as S[], setting, numberOfKeys) as S)
        : (returnObject(
            nested as Record<string, S>,
            setting,
            numberOfKeys
          ) as S);
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
    settings: RecordGenericSettings = {},
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
     * Display non object setting
     */
    const displayNonObject = (
      setting: string | boolean | number,
      key: string,
      mapOfKeys: string[],
      propName: string | null
    ): RenderedSetting<Settings> => {
      /**
       * List property
       */
      const prefix = (name_: string) => `${name_}:`;
      return (
        <li key={key}>
          {propName !== null ? prefix(propName) : ``}
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
    };
    /**
     * Display Array recursively
     */
    const displayArray = (
      setting_: GenericSettings[],
      map_: string[]
    ): RenderedSetting<Settings>[] => {
      let buffer_: RenderedSetting<Settings>[] = [];

      setting_.forEach((s__, index) => {
        const key_ = index.toString();
        const mapOfKeys = [...map_, key_];
        typeof s__ !== "object"
          ? buffer_.push(displayNonObject(s__, key_, mapOfKeys, null))
          : pushObjectOrArray(s__, key_, mapOfKeys);
      });

      return buffer_;
    };
    /**
     * Push Object Or Array
     */
    const pushObjectOrArray = (
      setting_: RecordGenericSettings | GenericSettings[],
      key_: string,
      map_: string[]
    ) => {
      buffer.push(
        <ul key={map_.toString()}>
          {Array.isArray(setting_) ? (
            <>{displayArray(setting_, map_)} </>
          ) : (
            <>
              {key_}:{display(setting_, map_)}
            </>
          )}
        </ul>
      );
    };
    /**
     * Display Record recursively
     */
    Object.keys(settings ?? {}).forEach((key) => {
      const mapOfKeys = [...map, key];
      let setting = settings[key];

      if (typeof setting === "object") {
        /**
         * New list at object (notice, this works for arrays too
         * with numbered properties)
         */
        pushObjectOrArray(setting, key, mapOfKeys);
      } else {
        buffer.push(displayNonObject(setting, key, mapOfKeys, key));
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
