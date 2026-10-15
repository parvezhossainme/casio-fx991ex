import {
  type PostfixToken,
  type SymbolName,
  type Token,
  startsPrimary,
  type OperatorToken,
} from "./tokens";
import { SPECIAL_FUNCTIONS } from "./functions";

/**
 * Expression AST. The parser is deliberately tolerant: incomplete input still produces a tree
 * (using `empty` placeholders) so the natural-textbook renderer always has something to draw.
 */
export type AstNode =
  | { type: "number"; text: string; tokenIndex: number }
  | { type: "symbol"; name: SymbolName; tokenIndex: number }
  | { type: "unary"; op: "-" | "+"; operand: AstNode; tokenIndex: number }
  | {
      type: "binary";
      op: OperatorToken;
      left: AstNode;
      right: AstNode;
      implicit?: boolean;
      tokenIndex: number;
    }
  | { type: "postfix"; op: PostfixToken; operand: AstNode; tokenIndex: number }
  | { type: "call"; name: string; args: AstNode[]; tokenIndex: number }
  | {
      type: "root";
      name: "sqrt" | "cbrt";
      radicand: AstNode;
      tokenIndex: number;
    }
  | { type: "group"; expr: AstNode; tokenIndex: number }
  | { type: "empty"; tokenIndex: number }
  | { type: "raw"; token: Token; tokenIndex: number }
  | { type: "row"; children: AstNode[]; tokenIndex: number };

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parseProgram(): AstNode {
    const node = this.parseAdditive();
    if (this.pos >= this.tokens.length) return node;

    const children: AstNode[] = [node];
    while (this.pos < this.tokens.length) {
      const before = this.pos;
      children.push(this.parseAdditive());
      if (this.pos === before) {
        const token = this.tokens[this.pos];
        if (token) children.push({ type: "raw", token, tokenIndex: this.pos });
        this.pos += 1;
      }
    }
    return { type: "row", children, tokenIndex: node.tokenIndex };
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();
    for (;;) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "+" || t.op === "-")) {
        const idx = this.pos;
        this.next();
        const right = this.parseMultiplicative();
        left = { type: "binary", op: t.op, left, right, tokenIndex: idx };
      } else {
        return left;
      }
    }
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();
    for (;;) {
      const t = this.peek();
      if (t?.kind === "op" && (t.op === "*" || t.op === "/")) {
        const idx = this.pos;
        this.next();
        const right = this.parseUnary();
        left = { type: "binary", op: t.op, left, right, tokenIndex: idx };
        continue;
      }
      if (startsPrimary(t)) {
        const idx = this.pos;
        const right = this.parseUnary();
        if (this.pos === idx) return left;
        left = {
          type: "binary",
          op: "*",
          left,
          right,
          implicit: true,
          tokenIndex: idx,
        };
        continue;
      }
      return left;
    }
  }

  private parseUnary(): AstNode {
    const t = this.peek();
    if (t?.kind === "op" && (t.op === "-" || t.op === "+")) {
      const idx = this.pos;
      this.next();
      const operand = this.parseUnary();
      return {
        type: "unary",
        op: t.op === "-" ? "-" : "+",
        operand,
        tokenIndex: idx,
      };
    }
    if (t?.kind === "root") {
      const idx = this.pos;
      this.next();
      const radicand = this.parseUnary();
      return { type: "root", name: t.name, radicand, tokenIndex: idx };
    }
    return this.parsePower();
  }

  private parsePower(): AstNode {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t?.kind === "op" && (t.op === "^" || t.op === "E")) {
      const idx = this.pos;
      this.next();
      const exponent = this.parseUnary();
      return {
        type: "binary",
        op: t.op,
        left: base,
        right: exponent,
        tokenIndex: idx,
      };
    }
    return base;
  }

  private parsePostfix(): AstNode {
    let node = this.parsePrimary();
    for (;;) {
      const t = this.peek();
      if (t?.kind === "postfix") {
        const idx = this.pos;
        this.next();
        node = { type: "postfix", op: t.op, operand: node, tokenIndex: idx };
      } else {
        return node;
      }
    }
  }

  private parsePrimary(): AstNode {
    const t = this.peek();
    if (!t) return { type: "empty", tokenIndex: this.pos };

    switch (t.kind) {
      case "number": {
        const start = this.pos;
        let text = "";
        while (this.peek()?.kind === "number") {
          const tok = this.next();
          if (tok && tok.kind === "number") text += tok.text;
        }
        return { type: "number", text, tokenIndex: start };
      }
      case "symbol": {
        const idx = this.pos;
        this.next();
        return { type: "symbol", name: t.name, tokenIndex: idx };
      }
      case "func": {
        const idx = this.pos;
        this.next();
        const args: AstNode[] = [];
        if (this.peek()?.kind === "lparen") {
          this.next();
          if (this.peek()?.kind !== "rparen") {
            args.push(this.parseAdditive());
            while (this.peek()?.kind === "comma") {
              this.next();
              args.push(this.parseAdditive());
            }
          }
          if (this.peek()?.kind === "rparen") this.next();
        }
        return { type: "call", name: t.name, args, tokenIndex: idx };
      }
      case "lparen": {
        const idx = this.pos;
        this.next();
        const expr = this.parseAdditive();
        if (this.peek()?.kind === "rparen") this.next();
        return { type: "group", expr, tokenIndex: idx };
      }
      default: {
        const idx = this.pos;
        this.next();
        return { type: "raw", token: t, tokenIndex: idx };
      }
    }
  }
}

/** Parse a token buffer into an AST. Never throws for incomplete input. */
export function parseTokens(tokens: Token[]): AstNode {
  if (tokens.length === 0) return { type: "empty", tokenIndex: 0 };
  return new Parser(tokens).parseProgram();
}

export function isSpecialCall(node: AstNode): boolean {
  return node.type === "call" && SPECIAL_FUNCTIONS.has(node.name);
}

/** Collect every token index referenced by the tree (used for caret placement and tests). */
export function collectTokenIndices(node: AstNode): number[] {
  const out: number[] = [];
  const walk = (n: AstNode): void => {
    switch (n.type) {
      case "number":
      case "symbol":
      case "raw":
        out.push(n.tokenIndex);
        break;
      case "unary":
        out.push(n.tokenIndex);
        walk(n.operand);
        break;
      case "binary":
        out.push(n.tokenIndex);
        walk(n.left);
        walk(n.right);
        break;
      case "postfix":
        out.push(n.tokenIndex);
        walk(n.operand);
        break;
      case "call":
        out.push(n.tokenIndex);
        n.args.forEach(walk);
        break;
      case "root":
        out.push(n.tokenIndex);
        walk(n.radicand);
        break;
      case "group":
        out.push(n.tokenIndex);
        walk(n.expr);
        break;
      case "row":
        n.children.forEach(walk);
        break;
      case "empty":
        break;
    }
  };
  walk(node);
  return out.sort((a, b) => a - b);
}
