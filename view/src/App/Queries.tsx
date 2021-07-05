import * as React from 'react';

/**
 *
 */
type Props = {
  name: string;
  id: string;
  queries: string[];
};
/**
 *
 */
export const Queries = (props: Props) => {
  return (
    <select name={props.name} id={props.id}>
      {props.queries.map((query) => (
        <option value={query} key={query}>
          {query}
        </option>
      ))}
    </select>
  );
};
