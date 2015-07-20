module.exports = {
    excludeFiles: [
        'node_modules/**',
        'coverage/**',
        'example/**'
    ],
    requireCurlyBraces: ['if', 'else', 'for', 'while', 'do'],
    requireSpaceAfterKeywords: ['do', 'else'],
    disallowSpaceAfterKeywords: ['if', 'for', 'while', 'switch'],
    disallowSpacesInFunction: {
        beforeOpeningRoundBrace: true
    },
    requireParenthesesAroundIIFE: true,
    disallowSpacesInsideArrayBrackets: true,
    disallowSpacesInsideObjectBrackets: true,
    disallowSpaceAfterObjectKeys: true,
    requireSpaceBeforeObjectValues: true,
    disallowSpaceAfterPrefixUnaryOperators: ['++', '--', '+', '-', '~', '!'],
    disallowSpaceBeforePostfixUnaryOperators: ['++', '--'],
    disallowSpaceBeforeBinaryOperators: [','],
    requireSpaceBeforeBinaryOperators: ['+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '&&', '||'],
    requireSpaceAfterBinaryOperators: [',', '+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '&&', '||'],
    requireSpaceBeforeBlockStatements: true,
    disallowKeywords: ['with'],
    disallowMultipleLineBreaks: true,
    disallowKeywordsOnNewLine: ['else'],
    disallowQuotedKeysInObjects: 'allButReserved',
    requireCapitalizedConstructors: true,
    requireLineFeedAtFileEnd: true,
    disallowPaddingNewlinesInBlocks: true,
    disallowTrailingWhitespace: true,
    disallowTrailingComma: true,
    requireSpacesInConditionalExpression: {
        afterTest: true,
        beforeConsequent: true,
        afterConsequent: true,
        beforeAlternate: true
    },
    requireSpaceAfterLineComment: {allExcept: ['#', '=', '/']},
    validateJSDoc: {
        checkParamNames: true,
        checkRedundantParams: true,
        requireParamTypes: true
    }
}
