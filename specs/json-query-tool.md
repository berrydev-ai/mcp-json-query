# JSON Query Tool Spec

We need an MCP tool added to this project that has the following features:

1. Can perform JSONPath queries on large JSON files given a file path and a query string. Example usage:

```
results = queryJson('path/to/file.json', '$.key')
```

The resulting structure would be:

```
{
    "data": [...],
    "count": 10,
    "query": "$.key",
    "status": "success",
    "error": null
}
```

`results.data` would contain the actual resulting data of the query
`results.count` would contain the number of results returned by the query (if available)
`results.query` would contain the query string used to generate the results
`results.status` would contain the status of the query (success, error, etc.)
`results.error` would contain any error message if the query failed

2. Can generate a JSON Schema given the path to a JSON file. Example usage:

```
schema = generateJsonSchema('path/to/file.json')
```

## Requirements

1. Use the library `jsonpath-plus` to perform JSONPath queries

## Guidelines

Please follow the patterns established in the existing example tool (calculator and greeting)
