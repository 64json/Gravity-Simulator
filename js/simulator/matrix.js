function iter(a, func) {
    const a_r = a.length;
    const m = new Array(a_r);
    for (let i = 0; i < a_r; i++) {
        m[i] = func(i);
    }
    return m;
}

module.exports = {
    add: (a, b) => {
        return iter(a, i => {
            return a[i] + b[i];
        });
    },

    sub: (a, b) => {
        return iter(a, i => {
            return a[i] - b[i];
        });
    },

    mul: (a, b) => {
        return iter(a, i => {
            return a[i] * b;
        });
    },

    div: (a, b) => {
        return iter(a, i => {
            return a[i] / b;
        });
    },

    dot: (a, b) => {
        const a_r = a.length;
        const a_c = a[0].length;
        const b_c = b[0].length;
        const m = new Array(a_r);
        for (let r = 0; r < a_r; r++) {
            m[r] = new Array(b_c);
            for (let c = 0; c < b_c; c++) {
                m[r][c] = 0;
                for (let i = 0; i < a_c; i++) {
                    m[r][c] += a[r][i] * b[i][c];
                }
            }
        }
        return m;
    }
};