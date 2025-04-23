# pathfinder
pathfinder (lowercase on-purpose) is a real-time interactive map that specializes in easier navigation and club interactivity.

## Getting Started

pathfinder runs on a Bun runtime, so install [bun](https://bun.sh).

Install the dependencies in your project root:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mobile Development

Testing on mobile:

```bash
bun run dev
```

then use ngrok to forward your port and display on your phone:

```bash
ngrok http 3000
```

## Making Changes
If you want to make changes to pathfinder, don't push to `stable`. Instead, create your own branch with the naming convention:

`[type]/[feature-sep-with-dashes-moday]`


...for example, if I had a feature where I had to create auth log-in for front-end, and today was Apr. 22, I'd do

`feat/front-auth-0422`

Every-time that you have a minor change, `git commit` it so that Biome can lint, format moving forward.

Then once you're finalized, create a PR with the Linear issue name using the command (CTRL/Command + Shift + .) and what you've changed.

## Docs
Documentation is required for feature changes, and existing should be modified for hotfixes and bug fixes.

Start documenting a main function by just adding a docstring above it describing:
```typescript
/**
 * Description of what the function/service does
 *
 * @param param_name - What the param is used for
 * @returns type - What the type is used for
 * @throws error - What specific error (code?) it throws
 */
```
