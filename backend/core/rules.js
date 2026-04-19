const analyzeNodes = (nodes) => {

  const grouped = {
    rootCause: [],
    secondary: [],
    info: []
  }

  nodes.forEach(node => {

    // Sequential scan (root cause)
    if (node.type === 'Seq Scan' && node.loops > 10) {
      grouped.rootCause.push({
        issue: 'Repeated Sequential Scan (Likely Missing Index)',
        suggestion: `Table "${node.table}" is scanned ${node.loops} times.`,
        raw: node.raw,
      })
    }

    // Nested loop inefficiency (root cause)
    if (node.type === 'Nested Loop') {
      const innerScan = nodes.find(n => n.type === 'Seq Scan' && n.loops > 10);

      if (innerScan) {
        grouped.rootCause.push({
          issue: 'Inefficient Nested Loop Join',
          suggestion: `Nested Loop is repeatedly scanning "${innerScan.table}".`,
          raw: node.raw,
        })
      }
    }

    // High cost (secondary)
    if (node.cost && node.cost > 1000) {
      grouped.secondary.push({
        issue: 'High estimated cost',
        suggestion: `Cost is ${node.cost}. Consider indexing or query optimization.`,
        raw: node.raw,
      })
    }

    // Row estimate mismatch (secondary)
    if (node.rows && node.actualRows !== null) {
      const ratio = node.actualRows / node.rows
      if (ratio > 10 || ratio < 0.1) {
        grouped.secondary.push({
          issue: 'Row estimate mismatch',
          suggestion: `Estimated ${node.rows}, got ${node.actualRows}. Run ANALYZE.`,
          raw: node.raw,
        })
      }
    }

    // Slow operation (secondary)
    if (node.actualTime && node.actualTime > 100) {
      grouped.secondary.push({
        issue: 'Slow operation detected',
        suggestion: `Node "${node.type}" took ${node.actualTime}ms.`,
        raw: node.raw,
      })
    }

  })

  // Global combined root cause (BEST INSIGHT)
  const nestedLoopNode = nodes.find(n => n.type === 'Nested Loop');
  const problematicScan = nodes.find(n => n.type === 'Seq Scan' && n.loops > 10);

  if (nestedLoopNode && problematicScan) {

    let sqlSuggestion = null;

    // Extract column from filter
    if (problematicScan.filter) {
      const match = problematicScan.filter.match(/(\w+)\.(\w+)/);

      if (match) {
        const table = match[1];
        const column = match[2];

        sqlSuggestion = `CREATE INDEX idx_${table}_${column} ON ${table}(${column});`
      }
    }

    grouped.rootCause = [{
      issue: 'Missing Index on Join Column',
      explanation: `Table "${problematicScan.table}" is scanned ${problematicScan.loops} times due to Nested Loop join.`,
      suggestion: `Create index on "${problematicScan.table}" to optimize join.`,
      /* recommended_sql: sqlSuggestion, */
      raw: problematicScan.raw,
    }];
  }

  const seen = new Set();
  grouped.secondary = grouped.secondary.filter(s => {
    if (seen.has(s.issue)) return false;
    seen.add(s.issue);
    return true;
  });

  if (grouped.rootCause.length === 0 &&
    grouped.secondary.length === 0) {
    return {
      success: true,
      message: "Query plan looks good!"
    }
  }

  // Clean empty groups
  if (grouped.rootCause.length === 0 &&
    grouped.secondary.length === 0) {
    return {
      success: true,
      message: "Query plan looks good!"
    }
  }

  return grouped
}

export default analyzeNodes