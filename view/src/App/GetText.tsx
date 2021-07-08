import * as React from 'react';

/**
 *
 */
type Props = {
  onClick: (value: string) => void;
  buttonText: string;
};
/**
 *
 */
export const GetText = (props: Props) => {
  /**
   * State of Text
   */
  const [text, setText] = React.useState("");
  /**
   * Return
   */
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button disabled={text === ""} onClick={() => props.onClick(text)}>
        {props.buttonText}
      </button>
    </>
  );
};
