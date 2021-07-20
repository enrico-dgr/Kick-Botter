import * as React from 'react';

/**
 *
 */
type Props = {
  name: string;
  id: string;
  queries: string[];
  default: {
    message: string;
    query: string;
  };
  onChange?: (query: string) => void;
};
/**
 *
 */
export const Queries = (props: Props) => {
  const [query, setQuery] = React.useState<string>(props.default.query);

  return (
    <select
      name={props.name}
      id={props.id}
      value={query}
      onChange={(e) => {
        const changedQuery = e.target.value;
        setQuery((_pv) => changedQuery);
        if (props.onChange) props.onChange(changedQuery);
      }}
    >
      {/* Default */}
      <option value={props.default.query}>{props.default.message}</option>
      {/* Values */}
      {props.queries.map((query_) => (
        <option value={query_} key={query_}>
          {query_}
        </option>
      ))}
    </select>
  );
};
