# Content protection design

The public platform follows one rule: **use the book's knowledge without distributing the book's content.**

## Not published

- No Turkish or English book PDF or DOCX.
- No full chapter archive.
- No complete Wrong/Improved example bank.
- No hidden downloadable book copy.
- No long book passages served through Ask the Guide.

## What is public

The browser needs a compact functional knowledge layer in order to work. It contains 120 short transformed problem principles, problem numbers, links to digital tools, section-specific diagnostic rules, and editable workflow fields. These are used for search, diagnosis, and decision support rather than to reconstruct the book.

A static website cannot make client-side JavaScript secret. Protection therefore relies on **not shipping the full source content**, rather than on obfuscation, disabling right-click, or pretending browser code cannot be inspected.

## User data

Drafts, project decisions, synthesis notes, and toolkit entries are processed/stored locally in the user's browser unless the user explicitly exports them.
