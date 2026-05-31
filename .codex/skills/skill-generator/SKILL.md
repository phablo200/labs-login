---
name: skill-generator
description: Create repository-local Codex skills from a required initial prompt and an optional skill name, using .codex/skills/template.md as the required SKILL.md structure.
---

# Skill Generator

## Purpose
Create a new skill folder under `.codex/skills/` with a `SKILL.md` file that follows `.codex/skills/template.md`.

## When to Use
Use this skill when the user asks to create a new repository-local Codex skill from an initial prompt, optionally providing the skill name to use for the generated folder and frontmatter.

## Inputs

This skill expects two parameters:

1. `initial_prompt` (required): the user's description of what the new skill should do.
2. `skill_name` (optional): the folder and frontmatter name for the new skill.

If `skill_name` is omitted, derive it from `initial_prompt` as a short kebab-case slug.

## Instructions

1. Read `.codex/skills/template.md` before drafting the new skill.
2. Determine the target skill name:
   - Use the provided `skill_name` when present.
   - Otherwise infer a concise kebab-case name from the `initial_prompt`.
   - Normalize names to lowercase kebab-case for the folder and frontmatter `name`.
3. Create `.codex/skills/<skill-name>/SKILL.md`.
4. Use the template's structure exactly unless the user explicitly asks for a different shape:
   - YAML frontmatter with `name` and `description`.
   - H1 title.
   - Purpose.
   - When to Use.
   - Instructions.
   - Output Format.
   - Examples.
5. Generate the new skill from the `initial_prompt`:
   - Make the frontmatter `description` trigger-focused, stating when Codex should use the skill.
   - Keep instructions concise and procedural.
   - Include only information needed for Codex to perform the task.
   - Prefer concrete steps and output expectations over broad explanation.
6. If `.codex/skills/<skill-name>/SKILL.md` already exists, inspect it first and update it only when the user clearly asked to overwrite or revise that skill. Otherwise ask before replacing it.
7. Do not create extra documentation files unless the prompt requires bundled scripts, references, or assets.

## Output Format

After creating or updating the skill, respond with:

- Created or updated path.
- Resolved skill name.
- Any assumptions made from the `initial_prompt`.
- Validation performed.

## Examples

Input:

```text
initial_prompt: Review React components for accessibility problems and suggest fixes.
skill_name: react-a11y-reviewer
```

Output:

```text
.codex/skills/react-a11y-reviewer/SKILL.md
```

Input:

```text
initial_prompt: Generate concise release notes from merged pull requests and grouped commit messages.
```

Output:

```text
.codex/skills/release-notes-generator/SKILL.md
```
