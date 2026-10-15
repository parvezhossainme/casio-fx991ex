"use client";

import { Fragment, type ReactNode } from "react";
import {
  type AstNode,
  POSTFIX_GLYPH,
  SYMBOL_GLYPH,
  TOKEN_GLYPH,
  FUNCTIONS,
  functionLabel,
  parseTokens,
  type Token,
} from "@/lib/engine";

interface CaretState {
  cursor: number;
  placed: boolean;
}

function CaretMark() {
  return <span className="calc-caret" aria-hidden="true" />;
}

function before(state: CaretState, index: number | undefined): ReactNode {
  if (index === undefined || state.placed) return null;
  if (index === state.cursor) {
    state.placed = true;
    return <CaretMark />;
  }
  return null;
}

function after(state: CaretState, index: number | undefined): ReactNode {
  if (index === undefined || state.placed) return null;
  if (index + 1 === state.cursor) {
    state.placed = true;
    return <CaretMark />;
  }
  return null;
}

function Operator({ glyph }: { glyph: string }) {
  return <span className="calc-op">{glyph}</span>;
}

const OPERATOR_GLYPH: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
};

function renderArgs(args: AstNode[], state: CaretState): ReactNode {
  return args.map((arg, index) => (
    <Fragment key={index}>
      {index > 0 && <Operator glyph="," />}
      {renderNode(arg, state)}
    </Fragment>
  ));
}

function renderNumber(
  node: Extract<AstNode, { type: "number" }>,
  state: CaretState,
): ReactNode {
  const chars = [...node.text];
  return (
    <span className="calc-num">
      {chars.map((char, i) => (
        <Fragment key={i}>
          {before(state, node.tokenIndex + i)}
          <span>{char}</span>
        </Fragment>
      ))}
    </span>
  );
}

/** Render an AST node in natural-textbook style, placing the caret as it is encountered. */
export function renderNode(node: AstNode, state: CaretState): ReactNode {
  switch (node.type) {
    case "number":
      return renderNumber(node, state);

    case "symbol":
      return (
        <span className="calc-symbol">
          {before(state, node.tokenIndex)}
          {node.name === "PreAns" ? "PreAns" : SYMBOL_GLYPH[node.name]}
          {after(state, node.tokenIndex)}
        </span>
      );

    case "empty":
      return (
        <span className="calc-empty">
          {before(state, node.tokenIndex)}
          <span className="calc-empty-box" />
          {after(state, node.tokenIndex)}
        </span>
      );

    case "raw":
      return (
        <span className="calc-symbol">
          {before(state, node.tokenIndex)}
          {node.token.kind === "op"
            ? TOKEN_GLYPH[node.token.op]
            : node.token.kind === "func"
              ? node.token.name
              : ""}
          {after(state, node.tokenIndex)}
        </span>
      );

    case "unary":
      return (
        <span className="calc-unary">
          {before(state, node.tokenIndex)}
          <Operator glyph={node.op === "-" ? "−" : "+"} />
          {renderNode(node.operand, state)}
          {after(state, node.tokenIndex)}
        </span>
      );

    case "binary":
      return renderBinary(node, state);

    case "postfix":
      return (
        <span className="calc-postfix">
          {renderNode(node.operand, state)}
          {before(state, node.tokenIndex)}
          {node.op === "^-1" ? (
            <sup>−1</sup>
          ) : (
            <span className="calc-mark">{POSTFIX_GLYPH[node.op]}</span>
          )}
          {after(state, node.tokenIndex)}
        </span>
      );

    case "group":
      return (
        <span className="calc-group">
          {before(state, node.tokenIndex)}
          <Operator glyph="(" />
          {renderNode(node.expr, state)}
          <Operator glyph=")" />
          {after(state, node.tokenIndex)}
        </span>
      );

    case "root":
      return (
        <span className="calc-root">
          {before(state, node.tokenIndex)}
          <span className="calc-radical">
            {node.name === "sqrt" ? "√" : "∛"}
          </span>
          <span className="calc-radicand">
            {renderNode(node.radicand, state)}
          </span>
          {after(state, node.tokenIndex)}
        </span>
      );

    case "call":
      return renderCall(node, state);

    case "row":
      return (
        <span className="calc-row">
          {node.children.map((child, index) => (
            <Fragment key={index}>{renderNode(child, state)}</Fragment>
          ))}
        </span>
      );
  }
}

function renderBinary(
  node: Extract<AstNode, { type: "binary" }>,
  state: CaretState,
): ReactNode {
  if (node.op === "/") {
    return (
      <span className="calc-frac">
        <span className="calc-frac-num">{renderNode(node.left, state)}</span>
        <span className="calc-frac-den">{renderNode(node.right, state)}</span>
      </span>
    );
  }

  if (node.op === "^") {
    return (
      <span className="calc-pow">
        {renderNode(node.left, state)}
        <sup>{renderNode(node.right, state)}</sup>
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  if (node.op === "E") {
    return (
      <span className="calc-exp">
        {renderNode(node.left, state)}
        {before(state, node.tokenIndex)}
        <span className="calc-mark">×10</span>
        <sup>{renderNode(node.right, state)}</sup>
      </span>
    );
  }

  const glyph = node.implicit ? "" : (OPERATOR_GLYPH[node.op] ?? node.op);
  return (
    <span className={node.implicit ? "calc-implicit" : "calc-binary"}>
      {renderNode(node.left, state)}
      {!node.implicit && (
        <>
          {before(state, node.tokenIndex)}
          <Operator glyph={glyph} />
        </>
      )}
      {renderNode(node.right, state)}
      {!node.implicit && after(state, node.tokenIndex)}
    </span>
  );
}

function renderCall(
  node: Extract<AstNode, { type: "call" }>,
  state: CaretState,
): ReactNode {
  const { name, args } = node;

  if (name === "sqrt" || name === "cbrt") {
    return (
      <span className="calc-root">
        {before(state, node.tokenIndex)}
        <span className="calc-radical">{name === "sqrt" ? "√" : "∛"}</span>
        <span className="calc-radicand">
          {args[0] ? renderNode(args[0], state) : null}
        </span>
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  if (name === "integ") {
    const [expr, lower, upper] = args;
    return (
      <span className="calc-call">
        {before(state, node.tokenIndex)}
        <span className="calc-radical">∫</span>
        <span className="calc-bounds">
          <sup>{lower ? renderNode(lower, state) : null}</sup>
          <sub>{upper ? renderNode(upper, state) : null}</sub>
        </span>
        <span className="calc-arg">
          {expr ? renderNode(expr, state) : null}
        </span>
        <span className="calc-mark">dx</span>
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  if (name === "sum") {
    const [expr, lower, upper] = args;
    return (
      <span className="calc-call">
        {before(state, node.tokenIndex)}
        <span className="calc-radical">Σ</span>
        <span className="calc-bounds">
          <sup>{upper ? renderNode(upper, state) : null}</sup>
          <sub>{lower ? renderNode(lower, state) : null}</sub>
        </span>
        <span className="calc-arg">
          {expr ? renderNode(expr, state) : null}
        </span>
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  if (name === "deriv") {
    const [expr, at] = args;
    return (
      <span className="calc-call">
        {before(state, node.tokenIndex)}
        <span className="calc-mark">d/dx</span>
        <Operator glyph="(" />
        {expr ? renderNode(expr, state) : null}
        <Operator glyph=")" />
        <span className="calc-bounds">
          <sub>{at ? renderNode(at, state) : null}</sub>
        </span>
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  if (name === "logb") {
    const [base, value] = args;
    return (
      <span className="calc-call">
        {before(state, node.tokenIndex)}
        <span className="calc-func">log</span>
        <sub className="calc-base">{base ? renderNode(base, state) : null}</sub>
        <Operator glyph="(" />
        {value ? renderNode(value, state) : null}
        <Operator glyph=")" />
        {after(state, node.tokenIndex)}
      </span>
    );
  }

  const label = FUNCTIONS[name] ? functionLabel(name) : name;
  return (
    <span className="calc-call">
      {before(state, node.tokenIndex)}
      <span className="calc-func">{label}</span>
      <Operator glyph="(" />
      {renderArgs(args, state)}
      <Operator glyph=")" />
      {after(state, node.tokenIndex)}
    </span>
  );
}

export interface ExpressionProps {
  tokens: Token[];
  cursor: number;
  className?: string;
}

/** Natural-textbook rendering of the input buffer with an editing caret. */
export function Expression({ tokens, cursor, className }: ExpressionProps) {
  const ast = parseTokens(tokens);
  const state: CaretState = { cursor, placed: false };
  const content = renderNode(ast, state);

  return (
    <span className={className ?? "calc-expr"} data-testid="expression">
      {tokens.length === 0 ? <CaretMark /> : content}
      {!state.placed && tokens.length > 0 ? <CaretMark /> : null}
    </span>
  );
}
