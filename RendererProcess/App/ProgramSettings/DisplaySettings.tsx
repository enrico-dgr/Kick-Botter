import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';

namespace Models {
  export type GenericSettings =
    | number
    | string
    | boolean
    | RecordGenericSettings
    | Array<GenericSettings>;

  export type RecordGenericSettings = {
    [k: string]: GenericSettings;
  };

  export type Props<Settings extends RecordGenericSettings> = {
    settings: Settings;
    onChange?: (settings: Settings) => void;
  };

  export type RenderedSetting<
    Settings extends RecordGenericSettings
  > = React.FunctionComponentElement<Props<Settings>>;
}

export const DisplaySettings = <Settings extends Models.RecordGenericSettings>(
  props: Models.Props<Settings>
): Models.RenderedSetting<Settings> => {
  /**
   * Change not-object property by providing an array of keys
   * of the nested objects and property.
   */
  const setStateOfSettings = (
    setting: string | number | boolean,
    keys: string[]
  ): void => {
    const mutateRecur = <S extends Models.GenericSettings>(
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

    if (props.onChange) props.onChange(mutateRecur(keys, props.settings));
  };

  const display = (
    settings: Models.RecordGenericSettings = {},
    map: string[] = []
  ): Models.RenderedSetting<Settings>[] => {
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

    let buffer: Models.RenderedSetting<Settings>[] = [];

    const displayNonObjectSetting = (
      setting: string | boolean | number,
      key: string,
      mapOfKeys: string[],
      propName: string | null
    ): Models.RenderedSetting<Settings> => {
      /**
       * List property
       */

      return (
        <div key={key} className="display-settings__prop">
          {propName !== null ? (
            <p className="display-settings__prop__name">{propName}</p>
          ) : (
            ``
          )}
          {pipe(
            setting,
            match(
              (b) => (
                <input
                  type="checkbox"
                  checked={b}
                  onChange={(e) =>
                    setStateOfSettings(e.target.checked, mapOfKeys)
                  }
                />
              ),
              (n) => (
                <input
                  type="number"
                  value={n}
                  onChange={(e) =>
                    setStateOfSettings(Number(e.target.value), mapOfKeys)
                  }
                />
              ),
              (s) => (
                <textarea
                  spellCheck={false}
                  value={s}
                  {...{
                    ...((stringToFit: string) => {
                      const columns = 30;
                      const rows = Math.round(
                        (stringToFit.length * 1.2) / columns
                      );
                      return {
                        cols: columns,
                        rows: rows === 0 ? 1 : rows,
                      };
                    })(s),
                  }}
                  onChange={(e) =>
                    setStateOfSettings(e.target.value, mapOfKeys)
                  }
                ></textarea>
              )
            )
          )}
        </div>
      );
    };

    const displayArrayRecursively = (
      setting_: Models.GenericSettings[],
      map_: string[]
    ): Models.RenderedSetting<Settings>[] => {
      let buffer_: Models.RenderedSetting<Settings>[] = [];

      setting_.forEach((s__, index) => {
        const key_ = index.toString();
        const mapOfKeys = [...map_, key_];
        typeof s__ !== "object"
          ? buffer_.push(displayNonObjectSetting(s__, key_, mapOfKeys, null))
          : pushObjectOrArray(s__, key_, mapOfKeys);
      });

      return buffer_;
    };

    const pushObjectOrArray = (
      setting_: Models.RecordGenericSettings | Models.GenericSettings[],
      key_: string,
      map_: string[]
    ) => {
      buffer.push(
        <div key={map_.toString()} className="display-settings__list">
          <p className="display-settings__list__name">{key_}:</p>
          {Array.isArray(setting_) ? (
            <>{displayArrayRecursively(setting_, map_)}</>
          ) : (
            <>
              <div className="display-settings__object">
                <div className="display-settings__object__side-line"></div>
                <div className="display-settings__list">
                  {display(setting_, map_)}
                </div>
              </div>
            </>
          )}
        </div>
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
        buffer.push(displayNonObjectSetting(setting, key, mapOfKeys, key));
      }
    });

    return buffer;
  };

  return (
    <div className="display-settings">
      <div className="display-settings__object">
        <div className="display-settings__object__side-line"></div>
        <div className="display-settings__list">{display(props.settings)}</div>
      </div>
    </div>
  );
};
