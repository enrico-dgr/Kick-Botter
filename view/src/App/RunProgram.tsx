import { ipcRenderer } from 'electron';
import * as React from 'react';

/**
 *
 */
type Props = {
  user: string;
  nameOfProgram: string;
  disabled: boolean;
};
/**
 *
 */
export const RunProgram = (props: Props) => {
  const runProgram = async ({ user, nameOfProgram }: Props) => {
    const res = (await ipcRenderer.invoke("runProgram", {
      user,
      nameOfProgram,
    })) as Response;
    //
    if (res.status !== 200) {
      console.error({
        status: res.status,
        statusText: res.statusText,
      });
    }
    return res.status;
  };
  /**
   * Graphic Responses
   */
  const baseColor = () => "#f3f3f0";
  const goodResponseColor = () => "#9ffca3";
  const badReponseColor = () => "#ff5858";
  const [buttonColor, setButtonColor] = React.useState<string>(baseColor());
  /**
   * Return
   */
  return (
    <button
      style={{
        backgroundColor: buttonColor,
      }}
      disabled={props.disabled}
      onClick={() =>
        runProgram(props).then((a) =>
          setButtonColor((_pv) =>
            a === 200 ? goodResponseColor() : badReponseColor()
          )
        )
      }
    >
      Run
    </button>
  );
};
