import { error } from 'console';

enum Filter {
  id,
  completed,
  search,
}
// TODO: Remove this any type and define a taskfilter type that can validate it
// use ur own types instead of the ones defined for you from express, ex ParsedQs
export function QueryBuilder(request: any) {
  let counter: number = 1;
  let conditions: any[] = [];

  const values: any[] = [];
  if (Object.keys(request).length === 0) {
    return { query: '', values };
  }
  for (const [key, value] of Object.entries(request)) {
    if (key in Filter) {
      let query;
      if (key.toLowerCase() === 'search') {
        query = 'title' + ' ILIKE' + ` '%${value}%'`;
      } else {
        values.push(value);
        query = key + ' =' + ' $' + counter;
        counter++;
      }
      conditions.push(query);
    } else {
      throw error(`Query Param '${key}' is not supported`);
    }
  }

  let query: string = 'where';
  // Disclaimer: I know using join here with ' and ' is better
  for (let i = 0; i < conditions.length; i++) {
    query = query + ' ' + conditions[i];
    try {
      if (conditions[i + 1]) {
        query = query + ' and';
      }
    } catch (error) {
      console.log(error);
      continue;
    }
  }

  return { query, values };
}
