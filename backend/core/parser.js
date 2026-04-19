const parseExplainPlain = (PlainText) => {

    const lines = PlainText
        .split('\n')
        .map(line => line.replace(/\t/g, ' '))
        .filter(Boolean);


    const nodes = [];
    let lastNode = null;

    lines.forEach(line => {
        const indent = line.search(/\S/); // count leading spaces
        const trimmed = line.trim();
        const isNode =
            line.includes('Seq Scan') ||
            line.includes('Index Scan') ||
            line.includes('Nested Loop') ||
            line.includes('Hash Join') ||
            line.includes('Sort');

        if (isNode) {
            const typeMatch = line.match(/^\s*(->)?\s*(Seq Scan|Index Scan|Nested Loop|Hash Join|Sort)/);
            const tableMatch = line.match(/on (\w+)/);
            const costMatch = line.match(/cost=\d+\.\d+\.\.(\d+\.\d+)/);
            const rowsMatch = line.match(/rows=(\d+)/);
            const timeMatch = line.match(/actual time=\d+\.\d+\.\.(\d+\.\d+)/);
            const loopsMatch = line.match(/loops=(\d+)/);

            const node = {
                type: typeMatch ? typeMatch[2] : null,
                table: tableMatch ? tableMatch[1] : null,
                cost: costMatch ? parseFloat(costMatch[1]) : null,
                rows: rowsMatch ? parseInt(rowsMatch[1]) : null,
                actualTime: timeMatch ? parseFloat(timeMatch[1]) : null,
                loops: loopsMatch ? parseInt(loopsMatch[1]) : 1,
                raw: trimmed,
                indent,
                children: []
            };

            nodes.push(node);
            lastNode = node;
        }
        else if (trimmed.includes('Filter') && lastNode) {
            const filterMatch = trimmed.match(/Filter:\s*\((.*)\)/);
            if (filterMatch) {
                lastNode.filter = filterMatch[1];
            }
        }

    });

    const stack = [];
    let root = null;

    nodes.forEach(node => {
        while (stack.length && stack[stack.length - 1].indent >= node.indent) {
            stack.pop();
        }

        if (stack.length === 0) {
            root = node;
        } else {
            stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
    });

    return { root, nodes }; // return both
};



export default parseExplainPlain;
