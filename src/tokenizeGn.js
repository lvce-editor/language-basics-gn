/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideString: 2,
  InsideLineComment: 3,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
}

/**
 * @enum number
 */
export const TokenType = {
  None: 1,
  Whitespace: 2,
  PunctuationString: 3,
  String: 4,
  Keyword: 5,
  Numeric: 6,
  Punctuation: 7,
  VariableName: 8,
  Comment: 885,
  Text: 9,
  Function: 10,
  LanguageConstant: 11,
  KeywordImport: 12,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.String]: 'String',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.Comment]: 'Comment',
  [TokenType.Text]: 'Text',
  [TokenType.Function]: 'Function',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.KeywordImport]: 'KeywordImport',
}

const RE_LINE_COMMENT = /^#.*/s
const RE_WHITESPACE = /^ +/
const RE_ANYTHING = /^.+/s
const RE_QUOTE_DOUBLE = /^"/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"]+/
const RE_KEYWORD =
  /^(?:if|else|true|false|assert|config|declare_args|defined|exec_script|foreach|get_label_info|get_path_info|get_target_outputs|getenv|import|print|process_file_template|propagates_configs|read_file|rebase_path|set_default_toolchain|set_defaults|set_sources_assignment_filter|template|tool|toolchain_args|toolchain|write_file)\b/
const RE_VARIABLE_NAME = /^[a-zA-Z\_\/\-]+/
const RE_PUNCTUATION = /^[:,;\{\}\[\]\.=\(\)<>\+\|\!\&]/
const RE_NUMERIC = /^\d+/

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
}

/**
 *
 * @param {any} lineStateA
 * @param {any} lineStateB
 * @returns
 */
export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

export const hasArrayReturn = true

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_KEYWORD))) {
          switch (next[0]) {
            case 'true':
            case 'false':
              token = TokenType.LanguageConstant
              break
            case 'assert':
            case 'config':
            case 'declare_args':
            case 'defined':
            case 'exec_script':
            case 'foreach':
            case 'get_label_info':
            case 'get_path_info':
            case 'get_target_outputs':
            case 'getenv':
            case 'print':
            case 'process_file_template':
            case 'propagates_configs':
            case 'read_file':
            case 'rebase_path':
            case 'set_default_toolchain':
            case 'set_defaults':
            case 'set_sources_assignment_filter':
            case 'template':
            case 'tool':
            case 'toolchain_args':
            case 'toolchain':
            case 'write_file':
              token = TokenType.Function
              break
            case 'import':
              token = TokenType.KeywordImport
              break
            default:
              token = TokenType.Keyword
              break
          }
          state = State.TopLevelContent
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = State.InsideString
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.InsideString:
        if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideString
        } else {
          throw new Error('no')
        }
        break
      default:
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
